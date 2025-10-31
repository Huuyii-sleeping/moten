<template>
  <div class="top-toolbar" v-if="!isPreview && isFreehandMode">
    <div class="tool-group">
      <button class="tool-btn" @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 10h10a8 8 0 0 1 8 8v0a8 8 0 0 1-8 8H3"></path>
          <path d="M3 10l5-5"></path>
          <path d="M3 10l5 5"></path>
        </svg>
      </button>
      <button class="tool-btn" @click="redo" :disabled="!canRedo" title="重做 (Ctrl+Y)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 10H11a8 8 0 0 0-8 8v0a8 8 0 0 0 8 8h10"></path>
          <path d="M21 10 16 5"></path>
          <path d="M21 10l-5 5"></path>
        </svg>
      </button>
      <div class="divider"></div>
      <button
        class="tool-btn"
        :class="{ active: !isEraser }"
        @click="toggleEraser(false)"
        title="画笔"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.83 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.83L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"
          ></path>
        </svg>
      </button>
      <button
        class="tool-btn"
        :class="{ active: isEraser }"
        @click="toggleEraser(true)"
        title="橡皮擦"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 13L5 5"></path>
          <path d="M7 5H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z"></path>
        </svg>
      </button>
      <div class="divider"></div>
      <el-color-picker
        v-model="lineColor"
        size="mini"
        class="color-picker"
        :predefine="['#000000', '#ff3e3e', '#37c2ff', '#36d399', '#fbbd23', '#f87272', '#94a3b8']"
        title="选择颜色"
      ></el-color-picker>
      <div class="width-selector">
        <span
          :class="{ active: lineWidth === 1 }"
          @click="lineWidth = 1"
          :style="{ height: '1px' }"
        ></span>
        <span
          :class="{ active: lineWidth === 3 }"
          @click="lineWidth = 3"
          :style="{ height: '3px' }"
        ></span>
        <span
          :class="{ active: lineWidth === 6 }"
          @click="lineWidth = 6"
          :style="{ height: '6px' }"
        ></span>
        <span
          :class="{ active: lineWidth === 10 }"
          @click="lineWidth = 10"
          :style="{ height: '10px' }"
        ></span>
      </div>
      <div class="divider"></div>
      <button class="tool-btn clear" @click="clearAllDraw" title="清空画布">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          ></path>
        </svg>
      </button>
    </div>
  </div>

  <canvas
    v-if="!isPreview && isFreehandMode"
    ref="drawCanvasRef"
    class="freehand-overlay"
    :style="{
      pointerEvents: isDrawing ? 'auto' : 'none', // 仅绘画时接收事件
      zIndex: isDrawing ? 200 : 100, // 绘画时临时提高层级，平时低于拖拽元素
    }"
    @mousedown="startDraw"
    @mousemove="drawing"
    @mouseleave="stopDraw"
    @touchstart="startDrawTouch"
    @touchmove="drawingTouch"
    @touchend="stopDraw"
  ></canvas>
</template>

<script setup lang="ts">
// 原封不动复制 Canvas 相关脚本（仅修改依赖传递方式）
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import getStroke from 'perfect-freehand'
import type { DrawLine } from '@/types/canvas'
import { defineProps, type PropType } from 'vue'

// 接收父组件传递的依赖（原代码中的 edit、canvasRef 等）
const props = defineProps({
  isPreview: { type: Boolean as PropType<boolean>, required: true },
  isFreehandMode: { type: Boolean as PropType<boolean>, required: true },
  viewport: { type: String, required: true },
  canvasRef: { type: Object as PropType<HTMLElement | null>, required: true },
  initialCanvasData: { type: String, default: '' },
})
// 向父组件传递事件（原代码中的 edit.setCanvasDrawData）
const emit = defineEmits<{
  (e: 'setCanvasDrawData', viewport: string, dataUrl: string): void
  (e: 'saveCurrentState'): void
}>()

// 原封不动复制 Canvas 相关状态
const drawCanvasRef = ref<HTMLCanvasElement | null>(null)
const drawCtx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const points = ref<{ x: number; y: number; pressure: number }[]>([])
const dpr = ref(window.devicePixelRatio || 1)
const drawHistory = ref<DrawLine[]>([])
const historyIndex = ref(-1)
const isEraser = ref(false)
const lineColor = ref('#000000')
const lineWidth = ref(3)

// 原封不动复制 Canvas 相关方法
const toggleEraser = (status: boolean) => {
  isEraser.value = status
}

watch([lineColor, lineWidth], () => {
  if (drawCtx.value && !isEraser.value) {
    drawCtx.value.strokeStyle = lineColor.value
    drawCtx.value.lineWidth = lineWidth.value
  }
})

const initDrawCanvas = () => {
  if (props.isPreview || !props.canvasRef || !drawCanvasRef.value) return
  const container = props.canvasRef
  const canvas = drawCanvasRef.value
  const rect = container.getBoundingClientRect()

  canvas.width = Math.round(rect.width * dpr.value)
  canvas.height = Math.round(rect.height * dpr.value)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  drawCtx.value = ctx
  ctx.scale(dpr.value, dpr.value)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const savedData = props.initialCanvasData
  if (savedData) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, rect.width, rect.height)
      if (drawHistory.value.length === 0) {
        const backgroundLine: DrawLine = {
          points: [],
          color: '',
          width: 0,
          isEraser: false,
          isBackground: true,
          imageData: savedData,
        }
        drawHistory.value = [backgroundLine]
        historyIndex.value = 0
      }
    }
    img.src = savedData
  } else {
    ctx.clearRect(0, 0, rect.width, rect.height)
    drawHistory.value = []
    historyIndex.value = -1
  }
}

const drawPoints = () => {
  if (!drawCanvasRef.value || !drawCtx.value || !props.canvasRef) return

  const ctx = drawCtx.value
  const containerRect = props.canvasRef.getBoundingClientRect()

  ctx.clearRect(0, 0, containerRect.width, containerRect.height)

  if (historyIndex.value >= 0) {
    const visibleHistory = drawHistory.value.slice(0, historyIndex.value + 1)
    const backgroundLine = visibleHistory.find((line) => line.isBackground)
    if (backgroundLine && backgroundLine.imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, containerRect.width, containerRect.height)
        drawOtherLines(visibleHistory, ctx)
      }
      img.src = backgroundLine.imageData
    } else {
      drawOtherLines(visibleHistory, ctx)
    }
  }

  if (isDrawing.value && points.value.length >= 2) {
    const currentColor = isEraser.value ? '#ffffff' : lineColor.value
    const currentWidth = isEraser.value ? 20 : lineWidth.value
    const currentStroke = getStroke(points.value, {
      size: currentWidth,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    })
    ctx.fillStyle = currentColor
    ctx.beginPath()
    if (currentStroke.length > 0) {
      ctx.moveTo(currentStroke[0][0], currentStroke[0][1])
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i][0], currentStroke[i][1])
      }
    }
    ctx.fill()
  }
}

const drawOtherLines = (lines: DrawLine[], ctx: CanvasRenderingContext2D) => {
  lines.forEach((line) => {
    if (line.isBackground) return
    if (line.points.length < 2) return
    const lineColor = line.isEraser ? '#ffffff' : line.color
    const lineWidth = line.isEraser ? 20 : line.width
    const stroke = getStroke(line.points, {
      size: lineWidth,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    })
    ctx.fillStyle = lineColor
    ctx.beginPath()
    if (stroke.length > 0) {
      ctx.moveTo(stroke[0][0], stroke[0][1])
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0], stroke[i][1])
      }
    }
    ctx.fill()
  })
}

const stopDraw = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    if (points.value.length >= 2) {
      let newHistory = drawHistory.value
      const backgroundIndex = newHistory.findIndex((line) => line.isBackground)
      if (backgroundIndex !== -1) {
        newHistory = newHistory.slice(0, backgroundIndex + 1)
      }
      const currentHistory: DrawLine = {
        points: [...points.value],
        color: lineColor.value,
        width: lineWidth.value,
        isEraser: isEraser.value,
      }
      newHistory.push(currentHistory)
      drawHistory.value = newHistory
      historyIndex.value = newHistory.length - 1
    }
    if (drawCanvasRef.value && props.canvasRef) {
      const containerRect = props.canvasRef.getBoundingClientRect()
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = containerRect.width
      tempCanvas.height = containerRect.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx && drawCanvasRef.value) {
        tempCtx.drawImage(
          drawCanvasRef.value,
          0,
          0,
          drawCanvasRef.value.width,
          drawCanvasRef.value.height,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        )
        const dataUrl = tempCanvas.toDataURL('image/png')
        emit('setCanvasDrawData', props.viewport, dataUrl)
      }
    }
    points.value = []
  }
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    drawPoints()
    saveCurrentState()
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    drawPoints()
    saveCurrentState()
  }
}

const saveCurrentState = () => {
  if (drawCanvasRef.value && props.canvasRef) {
    const containerRect = props.canvasRef.getBoundingClientRect()
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = containerRect.width
    tempCanvas.height = containerRect.height
    const tempCtx = tempCanvas.getContext('2d')
    if (tempCtx && drawCanvasRef.value) {
      tempCtx.drawImage(
        drawCanvasRef.value,
        0,
        0,
        drawCanvasRef.value.width,
        drawCanvasRef.value.height,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      )
      const dataUrl = tempCanvas.toDataURL('image/png')
      emit('setCanvasDrawData', props.viewport, dataUrl)
    }
  }
  emit('saveCurrentState')
}

const canUndo = computed(() => historyIndex.value >= 0)
const canRedo = computed(() => historyIndex.value < drawHistory.value.length - 1)

const getDrawPos = (e: MouseEvent | TouchEvent): { x: number; y: number; pressure: number } => {
  if (!props.canvasRef) return { x: 0, y: 0, pressure: 0.5 }

  const container = props.canvasRef
  const rect = container.getBoundingClientRect()
  let x = 0,
    y = 0,
    pressure = 0.5
  if (e instanceof MouseEvent) {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  } else if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0]
    x = touch.clientX - rect.left
    y = touch.clientY - rect.top
    pressure = touch.force || 0.5
  }
  x = Math.max(0, Math.min(x, rect.width))
  y = Math.max(0, Math.min(y, rect.height))
  return { x, y, pressure }
}

const startDraw = (e: MouseEvent) => {
  isDrawing.value = true
  points.value = [getDrawPos(e)]
  drawPoints()
}

const startDrawTouch = (e: TouchEvent) => {
  e.preventDefault()
  if (e.touches.length === 0) return
  isDrawing.value = true
  points.value = [getDrawPos(e)]
  drawPoints()
}

const drawing = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !drawCtx.value) return
  points.value.push(getDrawPos(e))
  drawPoints()
}

const drawingTouch = (e: TouchEvent) => {
  e.preventDefault()
  drawing(e)
}

const clearAllDraw = () => {
  if (!drawCtx.value || !props.canvasRef) return
  const rect = props.canvasRef.getBoundingClientRect()
  drawCtx.value.clearRect(0, 0, rect.width, rect.height)
  drawHistory.value = []
  historyIndex.value = -1
  points.value = []
  emit('setCanvasDrawData', props.viewport, '')
}

// 原封不动复制监听和生命周期
watch(
  () => props.isFreehandMode,
  (newMode, oldMode) => {
    if (!newMode && oldMode) {
      if (isDrawing.value) {
        stopDraw()
      }
      saveCurrentState()
    }
    if (newMode && !oldMode && !props.isPreview) {
      nextTick(() => {
        initDrawCanvas()
      })
    }
  },
  { immediate: true },
)

watch(
  () => props.viewport,
  () => {
    if (!props.isPreview) {
      setTimeout(initDrawCanvas, 0)
    }
  },
)

watch(
  () => props.isPreview,
  (isPreview) => {
    if (!isPreview) {
      nextTick(() => initDrawCanvas())
    }
  },
)

onMounted(() => {
  if (!props.isPreview) {
    nextTick(() => {
      initDrawCanvas()
    })
  }
})

onUnmounted(() => {
  // 原代码中无 Canvas 相关卸载逻辑，保持空白
})
</script>

<style scoped lang="scss">
/* 原封不动复制 Canvas 相关样式 */
.top-toolbar {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 20px;
  z-index: 9999; /* 确保在最顶层 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  .tool-group {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    overflow-x: auto;
    padding: 4px 0;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }
  }

  .tool-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    color: #475569;

    &:hover:not(:disabled) {
      background: #f1f5f9;
      color: #2563eb;
    }

    &.active {
      background: #2563eb;
      color: white;
    }

    &.clear {
      color: #ef4444;

      &:hover:not(:disabled) {
        background: #fee2e2;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .divider {
    width: 1px;
    height: 20px;
    background: #e2e8f0;
    margin: 0 4px;
  }

  .color-picker {
    width: 32px;
    height: 32px;
    --el-color-picker-trigger-width: 32px;
    --el-color-picker-trigger-height: 32px;
  }

  .width-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px;

    span {
      display: block;
      width: 20px;
      background: #cbd5e1;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: #2563eb;
        box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
      }

      &:hover {
        background: #94a3b8;
      }
    }
  }
}

.freehand-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  cursor: crosshair;
  z-index: 999;
}
</style>
