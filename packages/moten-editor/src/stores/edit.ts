import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlock, BaseBlockNull, Viewport } from '@/types/edit'

export const useEditStore = defineStore('edit', () => {
  const viewport = ref<Viewport>('desktop')
  const currentSelect = ref<BaseBlockNull>(null)
  const configPanelShow = ref<boolean | null>(false)
  const blockConfig = ref<BaseBlock[]>([])
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
  function setBlockConfig(value: BaseBlock[]){
    blockConfig.value = value
  }
  return {
    viewport,
    currentSelect,
    configPanelShow,
    isMobileViewport,
    blockConfig,
    setBlockConfig,
    setConfigPanelShow,
    setViewport,
    setCurrentSelect,
  }
})
