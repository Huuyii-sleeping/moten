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
  const pageCover = ref<any>()
  const shouldSyncToLocalCollab = ref(true)
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
    },
    { deep: true },
  )

  watch(
    pageConfig,
    (newVal) => {
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendPageConfigUpdate(newVal as any)
      }
    },
    { deep: true },
  )

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
  function initCollaboration(roomId: string) {
    collabStore.connect(roomId)
  }
  function stopCollaboration() {
    collabStore.disconnect()
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
  }
})
