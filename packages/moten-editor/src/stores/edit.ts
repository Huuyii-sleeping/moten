import { computed, nextTick, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock, BaseBlockNull, BasePage, Viewport } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'
import { useCollaborationStore } from './collaborationStore'

export const useEditStore = defineStore('edit', () => {
  const viewport = ref<Viewport>('desktop')
  const currentSelect = ref<BaseBlockNull>(null)
  const configPanelShow = ref<boolean | null>(false)
  const blockConfig = ref<BaseBlock[]>([])
  const pageConfig = ref<PageSchemaFormData>({})
  const isPreview = ref(false)
  const isEdit = ref(false)
  const pageCover = ref<any>()
  const diagnorseKey = ref(1)
  const shouldSyncToLocalCollab = ref(true)
  const canvasInstance = ref<any>()
  const canvasDrawData = ref<Record<string, string>>({})
  const isFreehandMode = ref(false)
  const toggleFreehandMode = () => {
    isFreehandMode.value = !isFreehandMode.value
  }
  const isMobileViewport = computed(() => {
    return viewport.value === 'mobile'
  })
  const collabStore = useCollaborationStore()
  watch(
    blockConfig,
    (newVal) => {
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendBlockConfigUpdate(newVal)
      }
      collabStore.sendBlockConfigUpdate(newVal, true)
    },
    { deep: true },
  )

  watch(
    pageConfig,
    (newVal, oldVal) => {
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendPageConfigUpdate(newVal as any)
      }
      collabStore.sendPageConfigUpdate(newVal as any, true)
    },
    { deep: true },
  )

  function addBlock(block: BaseBlock) {
    const newBlock = {
      ...block,
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    }
    blockConfig.value.push(newBlock)
    setCurrentSelect(newBlock)
  }

  watch(
    currentSelect,
    (newVal) => {
      if (collabStore.isConnected && newVal) {
        collabStore.sendUserSelection({
          blockId: newVal.id,
          userId: 'currentUser',
          timestamp: Date.now(),
        })
      }
    },
    { deep: true },
  )

  // 静默应用实现远程协同
  function applyRemoteBlockConfig(config: BaseBlock[]) {
    shouldSyncToLocalCollab.value = false
    blockConfig.value = config
    nextTick(() => {
      shouldSyncToLocalCollab.value = true
    })
  }

  function applyRemotePageConfig(config: PageSchemaFormData) {
    shouldSyncToLocalCollab.value = false
    pageConfig.value = config
    nextTick(() => {
      shouldSyncToLocalCollab.value = true
    })
  }

  function setViewport(value: Viewport) {
    viewport.value = value
  }

  function setCurrentSelect(value: BaseBlockNull) {
    currentSelect.value = value
  }

  function setConfigPanelShow(value: boolean) {
    configPanelShow.value = value
  }
  function setBlockConfig(value: BaseBlock[]) {
    blockConfig.value = value
  }
  function setPageConfig(value: BasePage) {
    pageConfig.value = value
  }
  function setPreview(value: boolean) {
    isPreview.value = value
  }
  function setPageCover(value: any) {
    pageCover.value = value
  }
  function initCollaboration(roomId: string, isEditor: boolean = true) {
    collabStore.connect(`${roomId}?isEditor=${isEditor}`)
  }
  function stopCollaboration() {
    collabStore.disconnect()
  }
  function setEdit(is: boolean) {
    isEdit.value = is
  }
  function setCanvasInstance(instance: any) {
    canvasInstance.value = instance
  }
  function setCanvasDrawData(viewport: string, dataUrl: string) {
    canvasDrawData.value[viewport] = dataUrl
  }
  return {
    viewport,
    currentSelect,
    configPanelShow,
    isMobileViewport,
    blockConfig,
    pageConfig,
    isPreview,
    pageCover,
    isEdit,
    diagnorseKey,
    canvasInstance,
    canvasDrawData,
    isFreehandMode,
    toggleFreehandMode,
    setCanvasDrawData,
    setCanvasInstance,
    setEdit,
    applyRemoteBlockConfig,
    applyRemotePageConfig,
    stopCollaboration,
    initCollaboration,
    setPageCover,
    setPreview,
    setPageConfig,
    setBlockConfig,
    setConfigPanelShow,
    setViewport,
    setCurrentSelect,
    addBlock,
  }
})
