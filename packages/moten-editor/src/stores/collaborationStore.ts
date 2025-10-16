import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'
import { useEditStore } from './edit'
import { applyPatch, compare } from 'fast-json-patch'
import type { BlockOperation, CanvasOperation } from '@/types/collab'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

interface CollaborativeState {
  blockConfig: BaseBlock[]
  pageConfig: PageSchemaFormData
  canvasState: {
    canvasDataUrl?: string
    lastOperationTime?: number
  }
}

export const useCollaborationStore = defineStore('collaboration', () => {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const lastReceivedMessageId = ref<string | null>(null)
  const lastSentMessageId = ref<string | null>(null)
  const userColors = ref<Record<string, string>>({})
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = ref(1000)
  const localVersion = ref(0)
  const remoteVersion = ref(0)
  const collaborativeState = ref<CollaborativeState>({
    blockConfig: [],
    pageConfig: {},
    canvasState: {},
  })
  const isCollaborating = computed(() => isConnected.value)
  const isApplyingRemoteUpdate = ref(false)
  const onlineUsers = ref(1)
  const remoteSelections = ref<Record<string, any>>({})
  const userList = ref<any[]>([])
  const router = useRouter()
  let currentDocId = ''
  // 收集历史记录和评论系统
  const historyRecords = ref<any[]>([])
  const comments = ref<any[]>([])
  const CanvasOperationQueue = ref<CanvasOperation[]>([])
  const isProcessingCanvasOp = ref(false)
  const pendingHistoryRequests = ref<
    Record<
      string,
      {
        resolve: (value?: unknown) => void
        reject: (error: Error) => void
        timeoutTimer: NodeJS.Timeout
      }
    >
  >({})

  function sendCanvasOperation(op: Omit<CanvasOperation, 'userId' | 'timestamp'>) {
    if (!isConnected.value) {
      return
    }
    const userId = localStorage.getItem('collab_user_id') || 'unknown_user'
    const operation: CanvasOperation = {
      ...op,
      userId,
      timestamp: Date.now(),
    }
    const messageId = generateMessageId()
    lastSentMessageId.value = messageId
    send({
      id: messageId,
      type: 'canvas_operation',
      payload: operation,
    })
    if (op.type === 'clear') {
      collaborativeState.value.canvasState.canvasDataUrl = ''
    } else if (op.type === 'init_canvas' && op.payload.canvasDataUrl) {
      collaborativeState.value.canvasState.canvasDataUrl = op.payload.canvasDataUrl
    }
  }
  // 请求画布当前的状态
  function fetchCanvasCurrentState() {
    if (!isConnected.value) return
    const messageId = generateMessageId()
    send({
      id: messageId,
      type: 'fetch_canvas_state',
      payload: { docId: currentDocId },
    })
  }
  // 处理画布之间的并发操作
  async function processCanvasOperationQueue() {
    if (isProcessingCanvasOp.value || CanvasOperationQueue.value.length === 0) return
    isProcessingCanvasOp.value = true
    try {
      const op = CanvasOperationQueue.value.shift()
      if (!op) {
        isProcessingCanvasOp.value = false
        return
      }
      const editStore = useEditStore()
      if (editStore.canvasInstance) {
        switch (op.type) {
          case 'draw':
          case 'tool_switch':
            await editStore.canvasInstance.applyRemoteDraw(op.payload)
            break
          case 'clear':
            await editStore.canvasInstance.clearCanvas(true)
            break
          case 'shape':
            await editStore.canvasInstance.applyRemoteShape(op.payload)
            break
          case 'init_canvas':
            await editStore.canvasInstance.loadCanvasData(op.payload.canvasDataUrl)
            break
          case 'undo':
            await editStore.canvasInstance.undo()
            break
          case 'redo':
            await editStore.canvasInstance.redo()
            break
        }
      }
    } catch (error) {
      console.error('处理画布操作失败', error)
    } finally {
      isProcessingCanvasOp.value = false
      processCanvasOperationQueue()
    }
  }

  function generateBrightColor(userId: string): string {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    const saturation = 70 + (hash % 20) // 70-90%
    const lightness = 40 + (hash % 20) // 40-60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  function attempReconnect(docId: string, isEditor: boolean, username: string = '匿名登录') {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('重连失败，已经达到最大次数')
      return
    }

    reconnectAttempts.value++
    connectionStatus.value = 'connecting'
    const delay = Math.min(reconnectDelay.value * reconnectAttempts.value, 10000)
    setTimeout(() => {
      console.log(`尝试第${reconnectAttempts}次重连...`)
      connect(docId, isEditor, username)
    }, delay)
  }

  // 连接 WebSocket
  async function connect(docId: string, isEditor: boolean = false, username: string = '匿名登录') {
    if (isConnected.value) return
    connectionStatus.value = 'connecting'
    localStorage.setItem('collab_docId', docId)
    localStorage.setItem('collab_isEditor', String(isEditor))
    localStorage.setItem('collab_username', username)
    if (!localStorage.getItem('collab_user_id')) {
      localStorage.setItem('collab_user_id', generateMessageId())
    }
    currentDocId = docId

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = 'localhost:8081'
      const wsUrl = `${wsProtocol}//${wsHost}?docId=${docId}&isEditor=${isEditor}&username=${username}`

      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('协同编辑连接成功')
        isConnected.value = true
        connectionStatus.value = 'connected'
        send({ type: 'fetch_full_state' })
        fetchCanvasCurrentState()
        fetchComments()
        fetchHistory()
      }

      ws.value.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleIncomingMessage(message, username)
      }

      ws.value.onclose = () => {
        console.log('协同编辑连接断开')
        isConnected.value = false
        connectionStatus.value = 'disconnected'
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket 错误:', error)
        connectionStatus.value = 'disconnected'
      }
    } catch (error) {
      console.error('连接失败:', error)
      connectionStatus.value = 'disconnected'
    }
  }

  function sendUserSelection(selection: any) {
    if (!isConnected.value) return
    send({ type: 'user_selection', payload: selection })
  }

  // 断开连接
  function disconnect(manual = true) {
    // 设置重连次数
    reconnectAttempts.value = 0
    if (manual) {
      localStorage.removeItem('collab_docId')
      localStorage.removeItem('collab_isEditor')
      localStorage.removeItem('collab_username')
      localStorage.removeItem('collab_room_id')
      localStorage.removeItem('collab_user_id')
    }
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isConnected.value = false
    connectionStatus.value = 'disconnected'
  }

  // 发送消息
  function send(message: any) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    }
  }

  function initCollabOnLoad() {
    const docId = localStorage.getItem('collab_docId')
    const isEditor = localStorage.getItem('collab_isEditor') === 'true'
    const username = localStorage.getItem('collab_username') || '匿名登录'

    if (docId) {
      connect(docId, isEditor, username)
    }
  }

  // 处理接收到的消息
  function handleIncomingMessage(message: any, username: string) {
    const editStore = useEditStore()
    if (message.id && message.id === lastSentMessageId.value) {
      return
    }
    if (message.id && message.id === lastReceivedMessageId.value) {
      return
    }
    lastReceivedMessageId.value = message.id || null
    isApplyingRemoteUpdate.value = true

    try {
      switch (message.type) {
        case 'full_state_response':
          const fullState = message.payload
          editStore.applyRemoteBlockConfig(fullState.blockConfig)
          editStore.applyRemotePageConfig(fullState.pageConfig)
          collaborativeState.value.canvasState = fullState.canvasState
          if (editStore.canvasInstance && fullState.canvasState?.canvasDataUrl) {
            editStore.canvasInstance.loadCanvasData(fullState.canvasState.canvasDataUrl)
          }
          historyRecords.value = fullState.history
          comments.value = fullState.comments
          onlineUsers.value = fullState.userCount
          break
        case 'initial_data':
          editStore.applyRemoteBlockConfig(message.payload.blockConfig || [])
          editStore.applyRemotePageConfig(message.payload.pageConfig || {})
          historyRecords.value = message.payload.history || []
          comments.value = message.payload.comments || []
          onlineUsers.value = message.payload.userCount || 1
          if (message.payload.canvasState?.canvasDataUrl) {
            collaborativeState.value.canvasState = message.payload.canvasState
            if (editStore.canvasInstance) {
              editStore.canvasInstance.loadCanvasData(message.payload.canvasState.canvasDataUrl)
            }
          }
          break
        // 处理画布操作消息
        case 'canvas_operation':
          const canvasOp = message.payload as CanvasOperation
          const currentId = localStorage.getItem('collab_user_id') || 'unknown_user'
          if (canvasOp.userId === currentId) return
          CanvasOperationQueue.value.push(canvasOp)
          processCanvasOperationQueue()
          break
        // 画布消息同步
        case 'canvas_state_response':
          if (message.payload.canvasDataUrl) {
            collaborativeState.value.canvasState.canvasDataUrl = message.payload.canvasDataUrl
            if (editStore.canvasInstance) {
              editStore.canvasInstance.loadCanvasData(message.payload.canvasDataUrl)
            }
          }
          break
        case 'new_history_record':
          historyRecords.value.unshift(message.payload.record)
          break
        case 'block_config_updated':
          editStore.applyRemoteBlockConfig(message.payload.blockConfig)
          break
        case 'page_config_updated':
          editStore.applyRemotePageConfig(message.payload.pageConfig)
          break
        case 'history_records':
          historyRecords.value = message.payload
          break
        case 'comment_added':
          comments.value.push(message.payload)
          const currentUser = username
          if (message.payload.mentions?.includes(currentUser)) {
            ElMessage.warning(`你被${message.payload.username}提及了`)
          }
          break
        case 'comment_resolved':
          const comment = comments.value.find((c) => c.id === message.payload.id)
          if (comment) comment.resolved = true
          break
        case 'comment_list':
          comments.value = message.payload
          break
        case 'block_operation':
          applyBlockOperation(message.payload)
          break
        case 'remote_selection':
          const { wsId, userId, blockId } = message.payload
          if (!userColors.value[userId]) {
            userColors.value[userId] = generateBrightColor(userId)
          }
          const color = userColors.value[userId]
          remoteSelections.value[message.payload.wsId] = {
            ...message.payload,
            color,
            lastSeen: Date.now(),
          }
          setTimeout(() => {
            if (remoteSelections.value[message.payload.wsId]) {
              delete remoteSelections.value[message.payload.wsId]
            }
          }, 5000)
          break
        case 'block_delta_applied':
          const currentBlocks = editStore.blockConfig
          let doc = currentBlocks as any
          try {
            const patched = applyPatch(doc, message.payload, true).newDocument
            const newBlocks = Array.isArray(patched) ? patched : patched.blocks || []
            editStore.applyRemoteBlockConfig(newBlocks)
          } catch (error) {
            console.error('Patch 应用失败', error)
          }
          break
        case 'conflict_detected':
          if (confirm('检测到冲突！其他用户已修改内容，是否强制覆盖？')) {
            const latestBlocks = message.payload.currentBlocks
            const newPatches = compare({ blocks: latestBlocks }, { blocks: editStore.blockConfig })
            sendBlockConfigDelta(newPatches)
          } else {
            editStore.applyRemoteBlockConfig(message.payload.currentBlocks)
          }
          break
        case 'block_delta_applied':
          localVersion.value = message.version
          break
        case 'user_joined':
          onlineUsers.value = message.payload.userCount || onlineUsers.value + 1
          break
        case 'user_left':
          onlineUsers.value = Math.max(1, message.payload.userCount || onlineUsers.value - 1)
          break
        case 'all_users':
          userList.value = message.payload
          break
        case 'history_updated':
          const pendingReq = pendingHistoryRequests.value[message.id]
          if (pendingReq) {
            clearTimeout(pendingReq.timeoutTimer)
            pendingReq.resolve()
          }
          delete pendingHistoryRequests.value[message.id]
          break
        case 'history_fetched':
          const pendingFetched = pendingHistoryRequests.value[message.id]
          if (pendingFetched) {
            clearTimeout(pendingFetched.timeoutTimer)
            pendingFetched.resolve()
          }
          delete pendingHistoryRequests.value[message.id]
          historyRecords.value = message.payload || []
          break
        case 'room_dismissed':
          ElMessage.warning(message.payload.reason)
          disconnect(true)
          router.push('/')
          break
      }
    } finally {
      isApplyingRemoteUpdate.value = false
    }
  }

  function dismissRoom() {
    send({ type: 'dismiss_room' })
  }

  function getAllUsers() {
    if (!isConnected.value) return
    send({ type: 'get_userlist' })
  }

  function addCommment(commentData: any) {
    if (!isConnected.value) return
    send({ type: 'add_comment', payload: commentData })
  }

  function resolveComment(commentId: string) {
    if (!isConnected.value) return
    send({ type: 'resolve_comment', payload: { id: commentId } })
  }

  function fetchComments() {
    if (!isConnected.value) return
    send({ type: 'get_comments' })
  }

  function applyBlockOperation(operation: BlockOperation) {
    const editStore = useEditStore()
    isApplyingRemoteUpdate.value = true
    try {
      switch (operation.op) {
        case 'add':
          editStore.blockConfig.push(operation.block)
          break
        case 'update':
          const blockToUpdate = editStore.blockConfig.find((b) => b.id === operation.id)
          if (blockToUpdate) {
            blockToUpdate.formData = { ...blockToUpdate.formData, ...operation.formData }
          }
          break
        case 'delete':
          const index = editStore.blockConfig.findIndex((b) => b.id === operation.id)
          if (index !== -1) {
            editStore.blockConfig.splice(index, 1)
          }
          break
        case 'move':
          const blockToMove = editStore.blockConfig.splice(operation.fromIndex, 1)[0]
          editStore.blockConfig.splice(operation.toIndex, 0, blockToMove)
          break
      }
    } finally {
      isApplyingRemoteUpdate.value = false
    }
  }

  function sendBlockOperation(operation: BlockOperation) {
    if (!isConnected) return
    const messageId = generateMessageId()
    lastSentMessageId.value = messageId
    send({ id: messageId, type: 'block_operation', payload: operation })
  }

  function applyRemoteState(state: CollaborativeState, isInit: boolean) {
    const editStore = useEditStore()

    if (state.blockConfig && !isInit) {
      editStore.$patch({
        blockConfig: state.blockConfig,
      })
    }

    if (state.pageConfig) {
      editStore.$patch({
        pageConfig: state.pageConfig,
      } as any)
    }

    if (state.canvasState) {
      collaborativeState.value.canvasState = state.canvasState
      if (editStore.canvasInstance && state.canvasState.canvasDataUrl) {
        editStore.canvasInstance.loadCanvasData(state.canvasState.canvasDataUrl)
      }
    }
  }

  function fetchHistory() {
    return new Promise((resolve, reject) => {
      if (!isConnected.value) {
        reject(new Error('ws未连接'))
      }
      const messageId = generateMessageId()
      const timeoutTimer = setTimeout(() => {
        delete pendingHistoryRequests.value[messageId]
      }, 5000)
      pendingHistoryRequests.value[messageId] = {
        resolve,
        reject,
        timeoutTimer,
      }
      send({ type: 'fetch_history', id: messageId })
    })
  }

  function sendHistoryUpdata(blockConfig: BaseBlock[], introduction: string = '') {
    return new Promise((resolve, reject) => {
      if (!isConnected.value) {
        const error = new Error('ws未连接')
        reject(error)
        return
      }
      const messageId = generateMessageId()
      const timeoutTimer = setTimeout(() => {
        delete pendingHistoryRequests.value[messageId]
        reject(new Error('历史更新没有响应'))
      }, 5000)
      pendingHistoryRequests.value[messageId] = {
        resolve,
        reject,
        timeoutTimer,
      }
      const updateHistory = {
        id: messageId,
        type: 'update_history',
        payload: blockConfig,
        userId: localStorage.getItem('collab_user_name'),
        introduction,
      }
      send(updateHistory)
    })
  }

  function sendBlockConfigUpdate(blockConfig: BaseBlock[], isPrivate = false) {
    if (!isConnected.value) return
    const messageId = crypto.randomUUID()
    const updateMessage = {
      id: messageId,
      type: isPrivate ? 'private_update_block_config' : 'update_block_config',
      payload: blockConfig,
    }
    lastSentMessageId.value = messageId
    send(updateMessage)
  }

  // 发送 pageConfig 更新 - 修改为匹配你的后端期望的消息格式
  function sendPageConfigUpdate(pageConfig: PageSchemaFormData, isPrivate = false) {
    if (!isConnected.value) return
    const pageId = crypto.randomUUID()
    const updateMessage = {
      id: pageId,
      type: isPrivate ? 'private_update_page_config' : 'update_page_config',
      payload: pageConfig,
    }
    // console.log(updateMessage)
    lastSentMessageId.value = pageId
    send(updateMessage)
  }

  function sendBlockConfigDelta(patched: any[]) {
    if (!isConnected.value) return
    const messageId = generateMessageId()
    lastSentMessageId.value = messageId
    send({
      id: messageId,
      type: 'update_block_delta',
      payload: patched,
      clientVersion: localVersion.value,
    })
  }

  function generateMessageId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
  }

  return {
    ws,
    isConnected,
    connectionStatus,
    isCollaborating,
    collaborativeState,
    localVersion,
    remoteVersion,
    isApplyingRemoteUpdate,
    onlineUsers,
    remoteSelections,
    historyRecords,
    comments,
    userList,
    CanvasOperationQueue,
    isProcessingCanvasOp,
    connect,
    disconnect,
    send,
    sendBlockConfigUpdate,
    sendPageConfigUpdate,
    applyRemoteState,
    sendUserSelection,
    sendBlockConfigDelta,
    sendBlockOperation,
    applyBlockOperation,
    fetchHistory,
    fetchComments,
    addCommment,
    resolveComment,
    getAllUsers,
    dismissRoom,
    sendHistoryUpdata,
    sendCanvasOperation,
    fetchCanvasCurrentState,
    initCollabOnLoad,
  }
})
