import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'
import { useEditStore } from './edit'
import { applyPatch } from 'fast-json-patch'

interface CollaborativeState {
  blockConfig: BaseBlock[]
  pageConfig: PageSchemaFormData
}

export const useCollaborationStore = defineStore('collaboration', () => {
  // WebSocket 连接
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const lastReceivedMessageId = ref<string | null>(null)
  const lastSentMessageId = ref<string | null>(null)

  // 用来对user的颜色进行区分
  const userColors = ref<Record<string, string>>({})

  // 新增状态，短线重连什么的
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = ref(1000)

  // 本地状态版本号（用于简单冲突检测）
  const localVersion = ref(0)
  const remoteVersion = ref(0)

  // 协同状态
  const collaborativeState = ref<CollaborativeState>({
    blockConfig: [],
    pageConfig: {},
  })

  // 计算属性
  const isCollaborating = computed(() => isConnected.value)

  const isApplyingRemoteUpdate = ref(false)

  const onlineUsers = ref(1)

  const remoteSelections = ref<Record<string, any>>({})

  let currentDocId = ''

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

  function attempReconnect(docId: string, isEditor: boolean) {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('重连失败，已经达到最大次数')
      return
    }

    reconnectAttempts.value++
    connectionStatus.value = 'connecting'
    const delay = Math.min(reconnectDelay.value * reconnectAttempts.value, 10000)
    setTimeout(() => {
      console.log(`尝试第${reconnectAttempts}次重连...`)
      connect(docId, isEditor)
    }, delay)
  }

  // 连接 WebSocket
  async function connect(docId: string, isEditor: boolean = false) {
    if (isConnected.value) return
    currentDocId = docId
    connectionStatus.value = 'connecting'

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = 'localhost:8081'
      const wsUrl = `${wsProtocol}//${wsHost}?docId=${docId}&isEditor=${isEditor}`

      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('协同编辑连接成功')
        isConnected.value = true
        connectionStatus.value = 'connected'
      }

      ws.value.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleIncomingMessage(message)
      }

      ws.value.onclose = () => {
        console.log('协同编辑连接断开')
        isConnected.value = false
        connectionStatus.value = 'disconnected'
        // 自动重连
        if (reconnectAttempts.value < maxReconnectAttempts) {
          attempReconnect(docId, isEditor)
        }
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
  function disconnect() {
    // 设置重连次数
    reconnectAttempts.value = 0
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

  // 处理接收到的消息
  function handleIncomingMessage(message: any) {
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
        case 'initial_data':
          editStore.applyRemoteBlockConfig(message.payload.blockConfig || [])
          editStore.applyRemotePageConfig(message.payload.pageConfig || {})
          if (message.payload.onlineUsers !== undefined) {
            onlineUsers.value = message.payload.onlineUsers
          }
          break

        case 'block_config_updated':
          editStore.applyRemoteBlockConfig(message.payload.blockConfig)
          break

        case 'page_config_updated':
          editStore.applyRemotePageConfig(message.payload.pageConfig)
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
        case 'user_joined':
          onlineUsers.value = message.payload.userCount || onlineUsers.value + 1
          break
        case 'user_left':
          onlineUsers.value = Math.max(1, message.payload.userCount || onlineUsers.value - 1)
          break
      }
    } finally {
      isApplyingRemoteUpdate.value = false
    }
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
  }

  function sendBlockConfigUpdate(blockConfig: BaseBlock[]) {
    if (!isConnected.value) return
    const messageId = crypto.randomUUID()
    const updateMessage = {
      id: messageId,
      type: 'update_block_config',
      payload: blockConfig,
    }
    lastSentMessageId.value = messageId
    send(updateMessage)
  }

  // 发送 pageConfig 更新 - 修改为匹配你的后端期望的消息格式
  function sendPageConfigUpdate(pageConfig: PageSchemaFormData) {
    if (!isConnected.value) return
    const pageId = crypto.randomUUID()
    const updateMessage = {
      id: pageId,
      type: 'update_page_config',
      payload: pageConfig,
    }
    lastSentMessageId.value = pageId
    send(updateMessage)
  }

  function sendBlockConfigDelta(patched: any[]) {
    if (!isConnected.value) return
    console.log(patched)
    const messageId = generateMessageId()
    lastSentMessageId.value = messageId
    send({ id: messageId, type: 'update_block_delta', payload: patched })
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
    connect,
    disconnect,
    send,
    sendBlockConfigUpdate,
    sendPageConfigUpdate,
    applyRemoteState,
    sendUserSelection,
    sendBlockConfigDelta,
  }
})
