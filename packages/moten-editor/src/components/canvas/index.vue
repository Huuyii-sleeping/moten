<template>
  <div class="canvas-wrapper" :style="{ width, height }">
    <!-- 竖排工具栏 -->
    <div class="vertical-toolbar" v-if="showToolbar">
      <!-- 工具按钮组 -->
      <div class="toolbar-group tools">
        <button
          v-for="tool in tools"
          :key="tool.type"
          class="toolbar-btn"
          :class="{ active: currentTool === tool.type }"
          @click="currentTool = tool.type"
          :title="tool.label"
        >
          <span :class="tool.icon">{{ tool.icon }}</span>
        </button>
      </div>

      <!-- 颜色选择器 -->
      <div class="toolbar-group color-selector">
        <label class="tool-label">颜色</label>
        <select v-model="brushColor" class="toolbar-select">
          <option v-for="color in colors" :key="color.value" :value="color.value">
            {{ color.label }}
          </option>
        </select>
      </div>

      <!-- 画笔大小 -->
      <div class="toolbar-group brush-size">
        <label class="tool-label" style="margin-bottom: 20px">大小</label>
        <input type="range" v-model="brushSize" min="1" max="50" class="toolbar-slider" />
        <span class="size-value" style="margin-top: 20px">{{ brushSize }}</span>
      </div>

      <!-- 操作按钮组 -->
      <div class="toolbar-group actions">
        <button class="toolbar-btn" @click="clearCanvas()" title="清空画布">
          <span>🗑️</span>
        </button>
        <button class="toolbar-btn" @click="undo" title="撤销">
          <span>↩️</span>
        </button>
        <button class="toolbar-btn" @click="redo" title="重做">
          <span>↪️</span>
        </button>
        <button class="toolbar-btn" @click="exportCanvas" title="导出图片">
          <span>📤</span>
        </button>
      </div>
    </div>

    <!-- 画布容器 -->
    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        class="drawing-canvas"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditStore } from '@/stores/edit'

// 组件属性
const props = defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
  showToolbar: {
    type: Boolean,
    default: true,
  },
  initialData: {
    type: String,
    default: '',
  },
})
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const startX = ref(0)
const startY = ref(0)
const currentTool = ref('brush')
const brushColor = ref('#000000')
const brushSize = ref(5)
const history = ref<string[]>([])
const historyIndex = ref(-1)
const redoStack = ref<string[]>([])
const editStore = useEditStore()
const collabStore = useCollaborationStore()

const tools = [
  { type: 'brush', icon: '🖌️', label: '画笔' },
  { type: 'eraser', icon: '🧽', label: '橡皮擦' },
  { type: 'rect', icon: '🔲', label: '矩形' },
  { type: 'circle', icon: '🔘', label: '圆形' },
  { type: 'line', icon: '📏', label: '直线' },
]

const colors = [
  { label: '黑色', value: '#000000' },
  { label: '红色', value: '#ff0000' },
  { label: '蓝色', value: '#0000ff' },
  { label: '绿色', value: '#00aa00' },
  { label: '黄色', value: '#ffff00' },
]

const initCanvas = async () => {
  await nextTick()
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const container = canvas.parentElement as HTMLElement

  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  ctx.value = canvas.getContext('2d')

  if (ctx.value) {
    ctx.value.lineJoin = 'round'
    ctx.value.lineCap = 'round'
    ctx.value.strokeStyle = brushColor.value
    ctx.value.lineWidth = brushSize.value
  }

  if (props.initialData) {
    loadImage(props.initialData)
  }
}

const loadImage = (dataUrl: string) => {
  const img = new Image()
  img.onload = () => {
    ctx.value?.drawImage(img, 0, 0)
    saveHistory()
  }
  img.src = dataUrl
}

const saveHistory = () => {
  if (!canvasRef.value) return
  const dataUrl = canvasRef.value.toDataURL()
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(dataUrl)
  historyIndex.value++
  redoStack.value = []
}

const applyRemoteDraw = (payload: any) => {
  if (!ctx.value) return
  if (payload.tool) {
    const remoteTool = payload.tool
    const remoteColor = payload.color || brushColor.value

    switch (remoteTool) {
      case 'eraser':
        ctx.value.strokeStyle = remoteColor
        ctx.value.globalCompositeOperation = 'destination-out'
        ctx.value.lineWidth = brushSize.value
        break
      case 'brush':
      case 'rect':
      case 'circle':
      case 'line':
        ctx.value.strokeStyle
    }
    currentTool.value = remoteTool
    return
  }
  ctx.value.strokeStyle = payload.color || brushColor.value
  ctx.value.lineWidth = payload.size || brushSize.value
  ctx.value.beginPath()
  ctx.value.moveTo(payload.lastX, payload.lastY)
  ctx.value.lineTo(payload.x, payload.y)
  ctx.value.stroke()
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const dataUrl = history.value[historyIndex.value]
    loadImage(dataUrl)
    redoStack.value.push(dataUrl)
  }
}

const redo = () => {
  if (redoStack.value.length > 0) {
    const dataUrl = redoStack.value.pop() as string
    loadImage(dataUrl)
    historyIndex.value++
  }
}

const clearCanvas = (isRemote = false) => {
  if (!ctx.value || !canvasRef.value) return
  saveHistory()
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  if (!isRemote) {
    collabStore.sendCanvasOperation({ type: 'clear', payload: {} })
  }
}

const applyRemoteShape = (payload: any) => {
  if (!ctx.value || isDrawing.value) return
  ctx.value.strokeStyle = payload.color || brushColor.value
  ctx.value.lineWidth = payload.size || brushSize.value
  ctx.value.beginPath()
  switch (payload.shapeType) {
    case 'rect':
      ctx.value.rect(
        payload.startX,
        payload.startY,
        payload.endX - payload.startX,
        payload.endY - payload.startY,
      )
      break
    case 'circle':
      const radius = Math.sqrt(
        Math.pow(payload.endX - payload.startX, 2) + Math.pow(payload.endY - payload.startY, 2),
      )
      ctx.value.arc(payload.startX, payload.startY, radius, 0, Math.PI * 2)
      break
    case 'line':
      ctx.value.moveTo(payload.startX, payload.startY)
      ctx.value.lineTo(payload.endX, payload.endY)
      break
  }
  ctx.value.stroke()
}

const loadCanvasData = (dataUrl: string) => {
  if (!canvasRef.value || !ctx.value) return
  const img = new Image()
  img.onload = () => {
    ctx.value?.clearRect(0, 0, canvasRef.value?.width as number, canvasRef.value?.height as number)
    ctx.value?.drawImage(img, 0, 0)
    saveHistory()
  }
  img.src = dataUrl
}

const exportCanvas = () => {
  if (!canvasRef.value) return
  const dataUrl = canvasRef.value.toDataURL()
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `canvas_${new Date().toISOString().slice(0, 19)}.png`
  link.click()
}

const getRelativeCoords = (e: MouseEvent | Touch) => {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  let clientX, clientY

  if (e instanceof MouseEvent) {
    clientX = e.clientX
    clientY = e.clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

const draw = (x: number, y: number) => {
  if (!ctx.value || !isDrawing.value) return

  ctx.value.beginPath()
  ctx.value.moveTo(lastX.value, lastY.value)
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
  collabStore.sendCanvasOperation({
    type: 'draw',
    payload: {
      x,
      y,
      lastX: lastX.value,
      lastY: lastY.value,
      color: brushColor.value,
      size: brushSize.value,
    },
  })
  lastX.value = x
  lastY.value = y
}

const drawShape = (x: number, y: number) => {
  if (!ctx.value) return

  ctx.value.beginPath()
  let shapeType = currentTool.value as 'rect' | 'circle' | 'line'
  switch (currentTool.value) {
    case 'rect':
      ctx.value.rect(startX.value, startY.value, x - startX.value, y - startY.value)
      break
    case 'circle':
      const radius = Math.sqrt(Math.pow(x - startX.value, 2) + Math.pow(y - startY.value, 2))
      ctx.value.arc(startX.value, startY.value, radius, 0, Math.PI * 2)
      break
    case 'line':
      ctx.value.moveTo(startX.value, startY.value)
      ctx.value.lineTo(x, y)
      break
  }
  ctx.value.stroke()
  if (isDrawing.value) {
    collabStore.sendCanvasOperation({
      type: 'shape',
      payload: {
        shapeType: shapeType,
        startX: startX.value,
        startY: startY.value,
        endX: x,
        endY: y,
        color: brushColor.value,
        size: brushSize.value,
      },
    })
  }
}

const handleMouseDown = (e: MouseEvent) => {
  const { x, y } = getRelativeCoords(e)
  isDrawing.value = true
  lastX.value = x
  lastY.value = y
  startX.value = x
  startY.value = y
}

const handleMouseMove = (e: MouseEvent) => {
  const { x, y } = getRelativeCoords(e)
  if (!isDrawing.value) return

  if (currentTool.value === 'brush' || currentTool.value === 'eraser') {
    draw(x, y)
  } else {
    const tempCtx = ctx.value?.getImageData(0, 0, canvasRef.value!.width, canvasRef.value!.height)
    drawShape(x, y)
    ctx.value?.putImageData(tempCtx!, 0, 0)
    drawShape(x, y)
  }
}

const handleMouseUp = () => {
  if (!isDrawing.value) return
  isDrawing.value = false
  saveHistory()
}

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  if (e.touches.length > 0) {
    handleMouseDown(e.touches[0] as any)
  }
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  if (e.touches.length > 0) {
    handleMouseMove(e.touches[0] as any)
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault()
  handleMouseUp()
}

watch(brushColor, (newColor) => {
  if (ctx.value) {
    ctx.value.strokeStyle = newColor
  }
})

watch(brushSize, (newSize) => {
  if (ctx.value) {
    ctx.value.lineWidth = newSize
  }
})

watch(currentTool, (newTool) => {
  if (ctx.value) {
    const color = newTool === 'eraser' ? '#ffffff' : brushColor.value
    ctx.value.strokeStyle = color
    collabStore.sendCanvasOperation({
      type: 'tool_switch',
      payload: { tool: newTool, color: color },
    })
  }
})

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
  editStore.setCanvasInstance({
    applyRemoteDraw,
    clearCanvas,
    applyRemoteShape,
    loadCanvasData,
    undo,
    redo,
  })

  if (collabStore.isConnected) {
    collabStore.fetchCanvasCurrentState()
  } else {
    const connectionWatch = watch(
      () => collabStore.isConnected,
      (isConnected) => {
        if (isConnected) {
          collabStore.fetchCanvasCurrentState()
          connectionWatch()
        }
      },
    )
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas)
})

defineExpose({
  clearCanvas,
  undo,
  redo,
  exportCanvas,
  getCanvasData: () => canvasRef.value?.toDataURL() || '',
})
</script>

<style scoped lang="scss">
.canvas-wrapper {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex; /* 使用flex布局放置竖排工具栏和画布 */
}

// 竖排工具栏样式
.vertical-toolbar {
  width: 60px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
  gap: 20px; /* 各组之间的间距 */
  z-index: 10;
}

.toolbar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px; /* 组内元素间距 */
  width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

// 工具按钮样式
.toolbar-btn {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: #e8f4ff;
    border-color: #c9e2ff;
  }

  &.active {
    background: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.15);
  }
}

// 工具标签样式
.tool-label {
  font-size: 12px;
  color: #666;
  margin-bottom: -5px; /* 拉近与下方控件的距离 */
}

// 颜色选择器样式
.toolbar-select {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 0 5px;
  font-size: 12px;
  text-align: center;
}

// 画笔大小滑块样式
.toolbar-slider {
  width: 100px;
  transform: rotate(-90deg); /* 旋转90度变成竖排滑块 */
  margin: 25px 0; /* 增加上下间距 */
}

.size-value {
  font-size: 12px;
  color: #666;
  width: 24px;
  text-align: center;
}

// 分隔线样式
.tools::after,
.color-selector::after {
  content: '';
  width: 30px;
  height: 1px;
  background: #eee;
  margin-top: 5px;
}

// 画布容器样式
.canvas-container {
  flex: 1; /* 占满剩余空间 */
  position: relative;
  background: #fff;
  overflow: hidden;
}

.drawing-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
}
</style>
