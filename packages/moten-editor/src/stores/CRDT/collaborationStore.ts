import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { Awareness } from 'y-protocols/awareness'
import { useEditStore } from '../edit'
import type { BaseBlock } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'
import type { BlockOperation, CanvasOperation } from '@/types/collab'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { generateUniqueId } from '@/utils'

interface YjsDocStructure {
  blocks: Y.Array<Y.Map<any>>
  pageConfig: Y.Map<any>
  canvasState: Y.Map<any>
  history: Y.Array<Y.Map<any>>
  comments: Y.Array<Y.Map<any>>
}

function getYjsDocStructure(doc: Y.Doc): YjsDocStructure {
  return {
    blocks: doc.getArray('blocks'),
    pageConfig: doc.getMap('pageConfig'),
    canvasState: doc.getMap('canvasState'),
    history: doc.getArray('history'),
    comments: doc.getArray('comments'),
  }
}

export const useCollaborationCRDT = defineStore('collaboration', () => {
  // 核心状态管理
  const ydoc = ref<Y.Doc>(new Y.Doc())
  const provider = ref<WebsocketProvider | null>(null)
  const awareness = ref<Awareness>(new Awareness(ydoc.value))
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnect' | 'connecting' | 'connected'>('disconnect')

  // 辅助状态
  const currentDocId = ref('')
  const userId = ref(localStorage.getItem('collab_user_id') || generateUserId())
  const username = ref(localStorage.getItem('collab_username') || '匿名用户')
  const userColors = ref<Record<string, string>>({})
  const onlineUsers = ref(0)
  const canvasOperationQueue = ref<CanvasOperation[]>([])
  const isProcessingCanvasOp = ref(false)
  const router = useRouter()

  function generateUserId(): string {
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem('collab_user_id', id)
    return id
  }

  function generateUserColor(userId: string): string {
    if (userColors.value[userId]) return userColors.value[userId]

    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`
    userColors.value[userId] = color
    return color
  }

  function initYjsListeners() {
    const yStruct = getYjsDocStructure(ydoc.value)
    const editStore = useEditStore()

    // 块配置同步
    yStruct.blocks.observe((event) => {
      if (event.transaction.origin === userId.value) return // 忽略本地操作
      const blocks = yStruct.blocks.toArray().map((map) => ({
        id: map.get('id'),
        type: map.get('type'),
        formData: map.get('formData'),
        position: map.get('position'),
      })) as any
      editStore.applyRemoteBlockConfig(blocks)
    })

    // 页面配置同步
    yStruct.pageConfig.observe((event: any) => {
      if (event.transaction.origin === userId.value) return
      const pageConfig = Object.fromEntries(yStruct.pageConfig.entries()) as any
      editStore.applyRemotePageConfig(pageConfig)
    })

    // 画布状态同步
    yStruct.canvasState.observe((event) => {
      if (event.transaction.origin === userId.value) return
      const canvasDataUrl = yStruct.canvasState.get('canvasDataUrl')
      if (canvasDataUrl && editStore.canvasInstance) {
        editStore.canvasInstance.loadCanvasData(canvasDataUrl)
      }
    })

    // 历史记录同步
    yStruct.history.observe((event) => {
      if (event.transaction.origin === userId.value) return
      // 可在这里触发历史记录UI更新
    })

    // 评论同步
    yStruct.comments.observe((event) => {
      if (event.transaction.origin === userId.value) return
      // 评论变化时的处理逻辑
    })

    // 用户状态变化监听
    awareness.value.on('update', () => {
      onlineUsers.value = awareness.value.getStates().size
      // 处理用户光标/选区同步
    })
  }

  // 连接协同服务
  function connect(docId: string, isEditor: boolean = false, userName: string = '匿名用户') {
    if (provider.value) provider.value.destroy()

    username.value = userName
    currentDocId.value = docId
    localStorage.setItem('collab_username', userName)
    localStorage.setItem('collab_docId', docId)
    localStorage.setItem('collab_isEditor', String(isEditor))

    // 初始化Yjs文档
    ydoc.value = new Y.Doc()
    awareness.value = new Awareness(ydoc.value)
    initYjsListeners()

    // 设置当前用户信息
    awareness.value.setLocalStateField('user', {
      id: userId.value,
      name: username.value,
      color: generateUserColor(userId.value),
      isEditor,
    })

    // 连接WebSocket
    connectionStatus.value = 'connecting'
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = import.meta.env.VITE_COLLAB_SERVER || 'localhost:8081'
    provider.value = new WebsocketProvider(
      `${wsProtocol}//${wsHost}`,
      `moten_${docId}`,
      ydoc.value,
      { awareness: awareness.value },
    )

    // 连接状态处理
    provider.value.on('status', (event) => {
      if (event.status === 'connected') {
        isConnected.value = true
        connectionStatus.value = 'connected'
        ElMessage.success('已连接到协同编辑服务')
      } else if (event.status === 'disconnected') {
        isConnected.value = false
        connectionStatus.value = 'disconnect'
        ElMessage.warning('协同连接已断开')
      }
    })
  }

  // 断开连接
  function disconnect(manual = true) {
    if (provider.value) {
      provider.value.destroy()
      provider.value = null
    }
    isConnected.value = false
    connectionStatus.value = 'disconnect'

    if (manual) {
      localStorage.removeItem('collab_docId')
      localStorage.removeItem('collab_isEditor')
    }
  }

  // 处理块操作（基于Yjs）
  function applyBlockOperation(operation: BlockOperation) {
    const yStruct = getYjsDocStructure(ydoc.value)
    const editStore = useEditStore()

    // 使用Yjs事务包装操作
    ydoc.value.transact(() => {
      switch (operation.op) {
        case 'add':
          const newBlock = new Y.Map()
          Object.entries(operation.block).forEach(([key, value]) => {
            newBlock.set(key, value)
          })
          yStruct.blocks.push([newBlock])
          break

        case 'update':
          const blockIndex = (yStruct.blocks as any).findIndex(
            (map: any) => map.get('id') === operation.id,
          )
          if (blockIndex !== -1) {
            const block = yStruct.blocks.get(blockIndex)
            Object.entries(operation.formData as any).forEach(([key, value]) => {
              block.set('formData', { ...block.get('formData'), value })
            })
          }
          break

        case 'delete':
          const delIndex = (yStruct.blocks as any).findIndex(
            (map: any) => map.get('id') === operation.id,
          )
          if (delIndex !== -1) {
            yStruct.blocks.delete(delIndex, 1)
          }
          break

        case 'move':
          if (operation.fromIndex !== operation.toIndex) {
            const [block] = (yStruct.blocks as any).splice(operation.fromIndex, 1)
            ;(yStruct.blocks as any).splice(operation.toIndex, 0, block)
          }
          break
      }
    }, userId.value) // 标记操作来源
  }

  // 发送画布操作
  function sendCanvasOperation(op: Omit<CanvasOperation, 'userId' | 'timestamp'>) {
    if (!isConnected.value || !provider.value) return

    const operation: CanvasOperation = {
      ...op,
      userId: userId.value,
      timestamp: Date.now(),
    }

    // 通过provider广播画布操作（非CRDT同步数据）
    provider.value.ws?.send(
      JSON.stringify({
        type: 'canvas_operation',
        payload: operation,
        userId: userId.value,
      }),
    )

    // 本地预应用
    if (op.type === 'clear') {
      const yStruct = getYjsDocStructure(ydoc.value)
      yStruct.canvasState.set('canvasDataUrl', '')
    } else if (op.type === 'init_canvas' && op.payload.canvasDataUrl) {
      const yStruct = getYjsDocStructure(ydoc.value)
      yStruct.canvasState.set('canvasDataUrl', op.payload.canvasDataUrl)
    }
  }

  // 处理接收到的画布操作
  function handleCanvasOperation(op: CanvasOperation) {
    if (op.userId === userId.value) return // 忽略自己发送的操作

    canvasOperationQueue.value.push(op)
    processCanvasOperationQueue()
  }

  // 处理画布操作队列
  async function processCanvasOperationQueue() {
    if (isProcessingCanvasOp.value || canvasOperationQueue.value.length === 0) return

    isProcessingCanvasOp.value = true
    try {
      const op = canvasOperationQueue.value.shift()
      if (!op) return

      const editStore = useEditStore()
      if (!editStore.canvasInstance) return

      switch (op.type) {
        case 'draw':
        case 'tool_switch':
          await editStore.canvasInstance.applyRemoteDraw(op.payload)
          break
        case 'clear':
          await editStore.canvasInstance.clearCanvas(true)
          // 更新Yjs中的画布状态
          const yStruct = getYjsDocStructure(ydoc.value)
          yStruct.canvasState.set('canvasDataUrl', '')
          break
        case 'shape':
          await editStore.canvasInstance.applyRemoteShape(op.payload)
          break
        case 'init_canvas':
          if (op.payload.canvasDataUrl) {
            await editStore.canvasInstance.loadCanvasData(op.payload.canvasDataUrl)
            // 更新Yjs中的画布状态
            const yStruct = getYjsDocStructure(ydoc.value)
            yStruct.canvasState.set('canvasDataUrl', op.payload.canvasDataUrl)
          }
          break
        case 'undo':
          await editStore.canvasInstance.undo()
          break
        case 'redo':
          await editStore.canvasInstance.redo()
          break
      }
    } catch (error) {
      console.error('处理画布操作失败:', error)
    } finally {
      isProcessingCanvasOp.value = false
      processCanvasOperationQueue()
    }
  }

  // 更新页面配置
  function updatePageConfig(config: Partial<PageSchemaFormData>) {
    const yStruct = getYjsDocStructure(ydoc.value)
    ydoc.value.transact(() => {
      Object.entries(config as any).forEach(([key, value]) => {
        yStruct.pageConfig.set(key, value)
      })
    }, userId.value)
  }

  // 添加评论
  function addComment(comment: any) {
    const yStruct = getYjsDocStructure(ydoc.value)
    const newComment = new Y.Map()
    Object.entries({
      ...comment,
      id: generateId(),
      userId: userId.value,
      username: username.value,
      timestamp: Date.now(),
      resolved: false,
    }).forEach(([key, value]) => {
      newComment.set(key, value)
    })

    ydoc.value.transact(() => {
      yStruct.comments.push([newComment])
    }, userId.value)
  }

  // 标记评论为已解决
  function resolveComment(commentId: string) {
    const yStruct = getYjsDocStructure(ydoc.value)
    const commentIndex = (yStruct.comments as any).findIndex(
      (map: any) => map.get('id') === commentId,
    )
    if (commentIndex !== -1) {
      ydoc.value.transact(() => {
        yStruct.comments.get(commentIndex).set('resolved', true)
      }, userId.value)
    }
  }

  // 添加历史记录
  function addHistoryRecord(introduction: string) {
    const yStruct = getYjsDocStructure(ydoc.value)
    const editStore = useEditStore()

    const record = new Y.Map()
    record.set('id', generateId())
    record.set('userId', userId.value)
    record.set('username', username.value)
    record.set('timestamp', Date.now())
    record.set('introduction', introduction)
    record.set('snapshot', JSON.stringify(editStore.blockConfig)) // 存储快照

    ydoc.value.transact(() => {
      yStruct.history.push([record])
    }, userId.value)
  }

  // 辅助函数：生成唯一ID
  function generateId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  }

  // 监听WebSocket消息（处理非CRDT数据）
  watch(provider, (newProvider) => {
    if (!newProvider) return

    newProvider.ws?.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data)
        switch (message.type) {
          case 'canvas_operation':
            handleCanvasOperation(message.payload)
            break
          case 'room_dismissed':
            ElMessage.warning(message.payload.reason)
            disconnect(true)
            router.push('/')
            break
        }
      } catch (error) {
        console.error('解析协同消息失败:', error)
      }
    })
  })

  // 页面加载时初始化
  function initOnLoad() {
    const docId = localStorage.getItem('collab_docId')
    const isEditor = localStorage.getItem('collab_isEditor') === 'true'
    const userName = localStorage.getItem('collab_username')

    if (docId && userName) {
      connect(docId, isEditor, userName)
    }
  }

  return {
    // 状态
    isConnected,
    connectionStatus,
    onlineUsers,
    awareness,
    userColors,
    currentDocId,
    userId,
    username,

    // 方法
    connect,
    disconnect,
    applyBlockOperation,
    sendCanvasOperation,
    updatePageConfig,
    addComment,
    resolveComment,
    addHistoryRecord,
    initOnLoad,

    // 辅助方法
    generateUserColor,
  }
})
