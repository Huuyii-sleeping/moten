import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCanvasStateStore = defineStore('canvasState', () => {
  const viewportOffsetX = ref(0)
  const viewportOffsetY = ref(0)

  const setViewportOffset = (x: number, y: number) => {
    viewportOffsetX.value = x
    viewportOffsetY.value = y
  }

  const setViewportOffsetX = (x: number) => {
    viewportOffsetX.value = x
  }

  const setViewportOffsetY = (y: number) => {
    viewportOffsetY.value = y
  }

  const getViewportOffset = () => {
    return { offsetX: viewportOffsetX.value, offsetY: viewportOffsetY.value }
  }

  return {
    viewportOffsetX,
    viewportOffsetY,
    getViewportOffset,
    setViewportOffset,
    setViewportOffsetX,
    setViewportOffsetY,
  }
})
