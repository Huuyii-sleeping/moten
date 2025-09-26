import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BaseBlockNull, Viewport } from '@/types/edit'

export const useEditStore = defineStore('edit', () => {
  const viewport = ref<Viewport>('desktop')
  const currentSelect = ref<BaseBlockNull>(null)
  function setViewport(value: Viewport) {
    viewport.value = value
  }
  function setCurrentSelect(value: BaseBlockNull) {
    currentSelect.value = value
  }
  return {
    viewport,
    currentSelect,
    setViewport,
    setCurrentSelect,
  }
})
