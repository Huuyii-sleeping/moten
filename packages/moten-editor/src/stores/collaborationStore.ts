import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'
import { useEditStore } from './edit'

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

  // 连接 WebSocket
  async function connect(docId: string) {
    if (isConnected.value) return

    connectionStatus.value = 'connecting'

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = 'localhost:8081'
      const wsUrl = `${wsProtocol}//${wsHost}?docId=${docId}`

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

  // 断开连接
  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      isConnected.value = false
      connectionStatus.value = 'disconnected'
    }
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
    connect,
    disconnect,
    send,
    sendBlockConfigUpdate,
    sendPageConfigUpdate,
    applyRemoteState,
  }
})
