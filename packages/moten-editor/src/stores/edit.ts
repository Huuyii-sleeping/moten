import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock, BaseBlockNull, BasePage, Viewport } from '@/types/edit'
import type { PageSchemaFormData } from '@/config/schema'

export const useEditStore = defineStore('edit', () => {
  const viewport = ref<Viewport>('desktop')
  const currentSelect = ref<BaseBlockNull>(null)
  const configPanelShow = ref<boolean | null>(false)
  const blockConfig = ref<BaseBlock[]>([])
  const pageConfig = ref<PageSchemaFormData>({})
  const isPreview = ref(false)
  const pageCover = ref<any>()
  const isMobileViewport = computed(() => {
    return viewport.value === 'mobile'
  })
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
  return {
    viewport,
    currentSelect,
    configPanelShow,
    isMobileViewport,
    blockConfig,
    pageConfig,
    isPreview,
    pageCover,
    setPageCover,
    setPreview,
    setPageConfig,
    setBlockConfig,
    setConfigPanelShow,
    setViewport,
    setCurrentSelect,
  }
})
