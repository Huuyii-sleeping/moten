import { computed, nextTick, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock, BaseBlockNull, BasePage, Viewport } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'
import { useCollaborationStore } from './collaborationStore'
import { compare } from 'fast-json-patch'

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
  let lastSentBlockConfig: BaseBlock[] = []
  watch(
    blockConfig,
    (newVal) => {
      // if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
      //   const patches = compare(lastSentBlockConfig, newVal)
      //   console.log(patches)
      //   if (patches.length > 0) {
      //     collabStore.sendBlockConfigDelta(patches)
      //     lastSentBlockConfig = [...newVal] // 保存快照
      //   }
      // }
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendBlockConfigUpdate(newVal)
      }
      collabStore.sendBlockConfigUpdate(newVal, true)
      console.log('blockConfig update', newVal)
    },
    { deep: true },
  )

  function addBlock(block: BaseBlock) {
    blockConfig.value.push(block)
    if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
      collabStore.sendBlockOperation({ op: 'add', block })
    }
  }

  function updateBlockFormData(blockId: string, newFormDate: Partial<BaseBlock['formData']>) {
    const block = blockConfig.value.find((b) => b.id === blockId)
    if (block) {
      block.formData = { ...block.formData, ...newFormDate }
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendBlockOperation({ op: 'update', id: blockId, formData: newFormDate })
      }
    }
  }

  function deleteBlock(blockId: string) {
    const index = blockConfig.value.findIndex((b) => b.id === blockId)
    if (index === -1) {
      blockConfig.value.splice(index, 1)
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendBlockOperation({ op: 'delete', id: blockId })
      }
    }
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const block = blockConfig.value.splice(fromIndex, 1)[0]
    blockConfig.value.splice(toIndex, 0, block)
    if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
      collabStore.sendBlockOperation({
        op: 'move',
        id: block.id,
        fromIndex,
        toIndex,
      })
    }
  }

  watch(
    pageConfig,
    (newVal) => {
      if (collabStore.isConnected && shouldSyncToLocalCollab.value) {
        collabStore.sendPageConfigUpdate(newVal as any)
      }
      collabStore.sendPageConfigUpdate(newVal as any, true)
    },
    { deep: true },
  )

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
    addBlock,
    updateBlockFormData,
    deleteBlock,
    moveBlock,
  }
})
