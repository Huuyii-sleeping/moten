<template>
  <div
    class="edit-render-drag"
    ref="canvasRef"
    :class="{ 'is-preview': edit.isPreview }"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <canvas
      v-if="!edit.isPreview && edit.isFreehandMode"
      ref="drawCanvasRef"
      class="freehand-overlay"
      :style="{ pointerEvents: edit.isFreehandMode || edit.isArrowMode ? 'auto' : 'none' }"
      @mousedown="startDraw"
      @mousemove="drawing"
      @mouseup="stopDraw"
      @mouseleave="stopDraw"
      @touchstart="startDrawTouch"
      @touchmove="drawingTouch"
      @touchend="stopDraw"
    ></canvas>
    <div
      v-for="element in props.list"
      :key="element.id"
      :data-id="element.id"
      class="element"
      :style="getElementStyle(element)"
      @mouseenter="hoverId = element.id"
      @mouseleave="hoverId = ''"
      @click="handleElementClick(element)"
      :class="{ 'preview-disabled': edit.isPreview }"
      @dragover.prevent="() => {}"
      @drop.prevent="() => {}"
    >
      <!-- 原有模板内容完全不变 -->
      <div v-if="edit.isPreview">
        <div v-if="element.nested && level < 2">
          <component
            :is="renderComponentCode(element)"
            :key="element.id"
            :data="element.formData"
            :viewport="edit.viewport"
            :children="element.children"
          >
            <template #default="{ item, index }">
              <InteractRenderDrag
                :key="`${element.id}-${index}`"
                :list="item"
                :level="level + 1"
                :parent-id="element.id"
                class="nested-item"
                :class="nestedClass"
              />
            </template>
          </component>
        </div>

        <div v-else-if="element.type">
          <div v-if="element.type === 'el'">
            <component
              :is="renderComponentCode(element)"
              v-bind="getComponentValues(element.formData)"
              v-model="getComponentValues(element.formData)['content']"
            >
              {{ getComponentValues(element.formData)['content'] }}
            </component>
          </div>
          <div v-else>
            <component
              :is="getPluginComponent(element.code)"
              v-bind="getComponentValues(element.formData)"
            />
          </div>
        </div>

        <div v-else>
          <component
            :is="renderComponentCode(element)"
            :key="element.id"
            :data="element.formData"
            :viewport="edit.viewport"
          />
        </div>
      </div>

      <div v-else>
        <div
          v-if="element.nested && level < 2"
          class="block-nested-render"
          :class="activeClass(element)"
        >
          <transition name="fade">
            <edit-render-hover
              v-show="hoverId === element.id"
              :id="element.id"
              :name="element.name"
              @copy="copy"
              @clear="clear"
            />
          </transition>
          <component
            :is="renderComponentCode(element)"
            :key="element.id"
            :data="element.formData"
            :viewport="edit.viewport"
            :children="element.children"
          >
            <template #default="{ item, index }">
              <InteractRenderDrag
                :key="`${element.id}-${index}`"
                :list="item"
                :level="level + 1"
                :parent-id="element.id"
                class="nested-item"
                :class="nestedClass"
              />
            </template>
          </component>
        </div>

        <div v-else-if="element.type" class="block-render" :class="activeClass(element)">
          <div v-if="element.type === 'el'">
            <performance-monitor-wrapper :component-id="element.id">
              <component
                :is="renderComponentCode(element)"
                v-bind="getComponentValues(element.formData)"
                v-model="getComponentValues(element.formData)['content']"
              >
                {{ getComponentValues(element.formData)['content'] }}
              </component>
            </performance-monitor-wrapper>
          </div>
          <div v-else>
            <performance-monitor-wrapper :component-id="element.id">
              <component
                :is="getPluginComponent(element.code)"
                v-bind="getComponentValues(element.formData)"
              />
            </performance-monitor-wrapper>
          </div>
        </div>

        <div v-else class="block-render" :class="activeClass(element)">
          <transition name="fade">
            <edit-render-hover
              v-show="hoverId === element.id"
              :id="element.id"
              :name="element.name"
              @copy="copy"
              @clear="clear"
            />
          </transition>
          <performance-monitor-wrapper :component-id="element.id">
            <component
              :is="renderComponentCode(element)"
              :key="element.id"
              :data="element.formData"
              :viewport="edit.viewport"
            />
          </performance-monitor-wrapper>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditStore } from '@/stores/edit'
import type { BaseBlock } from '@/types/edit'
import pluginManager from '@/utils/pluginManager'
import { COMPONENT_PREFIX } from '@moten/ui'
import {
  computed,
  h,
  onMounted,
  onUnmounted,
  ref,
  nextTick,
  watch,
  createTextVNode,
  shallowRef,
} from 'vue'
import interact from 'interactjs'
import performanceMonitorWrapper from '../performance/performanceMonitorWrapper.vue'
import { nestedClass } from './utils/nested'
import getStroke from 'perfect-freehand'
import type { DrawLine } from '@/types/canvas'
import { useCanvasStateStore } from '@/stores/canvasState'
import { generateUniqueId } from '@/utils'
import { throttle } from 'lodash-es'
const edit = useEditStore()
const collabStore = useCollaborationStore()
const props = defineProps({
  list: {
    type: Array<BaseBlock>,
    required: true,
    default: () => [],
  },
  level: {
    type: Number,
    default: 1,
  },
  parentId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits<{
  (e: 'update:list', value: BaseBlock[]): void
}>()
const canvasRef = ref<HTMLElement | null>(null)
const hoverId = ref('')
const flattenedListRef = shallowRef<BaseBlock[]>([])
const flattenedList = computed(() => flattenedListRef.value)
// 缓存节点ID，和所在数组，索引的映射（当引用变化更新时候触发）
const nodeMap = ref<Map<string, { array: BaseBlock[]; index: number }>>(new Map())

// 画笔相关的操作
const drawCanvasRef = ref<HTMLCanvasElement | null>(null)
const drawCtx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const points = ref<{ x: number; y: number; pressure: number }[]>([])
const dpr = ref(window.devicePixelRatio || 1)
const isEraser = ref(false)
const lineColor = ref('#000000')
const lineWidth = ref(3)
const isDrawingArrow = ref(false)
const arrowStartPos = ref<{ x: number; y: number } | null>(null)
const arrowEndPos = ref<{ x: number; y: number } | null>(null)
const canvasState = useCanvasStateStore()
let isHandingDrop = ref(false)
let isDraggingCanvas = ref(false)
let lastCanvasDragPos = ref<{ x: number; y: number } | null>(null)

const handleDrop = (event: DragEvent) => {
  if (isHandingDrop.value) return
  isHandingDrop.value = true
  if (!canvasRef.value || !event.dataTransfer) return
  if (event.dataTransfer.dropEffect !== 'copy') return

  const target = event.target as HTMLElement
  if (target.closest('.element')) {
    isHandingDrop.value = false
    return
  }
  // 获取画布容器的位置，用来计算鼠标相对画布的坐标
  const canvasRect = canvasRef.value.getBoundingClientRect()
  // 计算鼠标在画布中的相对坐标（相对画布的左上角）
  const mouseX = event.clientX - canvasRect.left
  const mouseY = event.clientY - canvasRect.top

  const dragData = event.dataTransfer.getData('application/json')
  if (!dragData) {
    isHandingDrop.value = false
    return
  }
  if (!dragData) return
  const newBlock = JSON.parse(dragData) as BaseBlock
  // 关键抵消视口的偏移，使得能够让组件显示在鼠标的位置
  // 原理：元素最终位置 = 鼠标相对位置 - 视口的偏移
  newBlock.id = generateUniqueId()
  newBlock.x = mouseX - canvasState.viewportOffsetX
  newBlock.y = mouseY - canvasState.viewportOffsetY

  newBlock.width = newBlock.width || 200
  newBlock.height = newBlock.height || 200

  edit.addBlock(newBlock)
  event.dataTransfer.clearData()
  setTimeout(() => {
    isHandingDrop.value = false
  }, 100)
}

const handleCanvasMouseDown = (e: MouseEvent) => {
  if (edit.isPreview || edit.isFreehandMode || edit.isArrowMode) return
  if ((e.target as HTMLElement).closest('.element')) return
  isDraggingCanvas.value = true
  lastCanvasDragPos.value = { x: e.clientX, y: e.clientY }
  document.body.style.cursor = 'grabbing'
}

const handleCanvasMouseMove = (e: MouseEvent) => {
  if (!isDraggingCanvas.value || !lastCanvasDragPos.value) return
  const dx = e.clientX - lastCanvasDragPos.value.x
  const dy = e.clientY - lastCanvasDragPos.value.y
  canvasState.setViewportOffsetX(canvasState.viewportOffsetX + dx)
  canvasState.setViewportOffsetY(canvasState.viewportOffsetY + dy)
  lastCanvasDragPos.value = { x: e.clientX, y: e.clientY }
}

const handleCanvasMouseUp = () => {
  isDraggingCanvas.value = false
  lastCanvasDragPos.value = null
  document.body.style.cursor = ''
}

// 初始化操作
const initDrawCanvas = () => {
  if (edit.isPreview || !canvasRef.value || !drawCanvasRef.value) return
  const container = canvasRef.value
  const canvas = drawCanvasRef.value
  const rect = container.getBoundingClientRect()

  // 设置整个会话尺寸
  canvas.width = Math.round(rect.width * dpr.value)
  canvas.height = Math.round(rect.height * dpr.value)

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  drawCtx.value = ctx
  ctx.scale(dpr.value, dpr.value)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalCompositeOperation = 'source-over'
  // ctx.translate(-canvasState.viewportOffsetX, -canvasState.viewportOffsetY)

  // const savedData = edit.canvasDrawData?.[edit.viewport] || ''
  // if (savedData) {
  //   const img = new Image()
  //   img.onload = () => {
  //     ctx.drawImage(img, 0, 0, rect.width, rect.height)
  //     if (edit.drawHistory.length === 0) {
  //       const backgroundLine: DrawLine = {
  //         points: [],
  //         color: '',
  //         width: 0,
  //         isEraser: false,
  //         isBackground: true,
  //         imageData: savedData,
  //       }
  //       edit.drawHistory = [backgroundLine]
  //       edit.historyIndex = 0
  //     }
  //   }
  //   img.src = savedData
  // } else {
  //   ctx.clearRect(0, 0, rect.width, rect.height)
  //   edit.drawHistory = []
  //   edit.historyIndex = -1
  // }
  drawPoints()
}

// 绘制操作
const drawPoints = () => {
  if (!drawCanvasRef.value || !drawCtx.value || !canvasRef.value) return

  const ctx = drawCtx.value
  const containerRect = canvasRef.value.getBoundingClientRect()

  ctx.save()
  ctx.setTransform(dpr.value, 0, 0, dpr.value, 0, 0)
  ctx.translate(canvasState.viewportOffsetX, canvasState.viewportOffsetY)

  ctx.clearRect(
    -canvasState.viewportOffsetX,
    -canvasState.viewportOffsetY,
    containerRect.width,
    containerRect.height,
  )

  if (edit.historyIndex >= 0) {
    const visibleHistory = edit.drawHistory.slice(0, edit.historyIndex + 1)
    drawOtherLines(visibleHistory, ctx)
    // const backgroundLine = visibleHistory.find((line) => line.isBackground)
    // if (backgroundLine && backgroundLine.imageData) {
    //   const img = new Image()
    //   img.onload = () => {
    //     ctx.drawImage(img, 0, 0, containerRect.width, containerRect.height)
    //     drawOtherLines(visibleHistory, ctx)
    //   }
    //   img.src = backgroundLine.imageData
    // } else {
    //   drawOtherLines(visibleHistory, ctx)
    // }
  }

  // 2. 绘制当前正在画的线条（如果处于绘制中）
  if (edit.isArrowMode && isDrawingArrow.value && arrowEndPos.value && arrowStartPos.value) {
    drawSingleArrow(arrowStartPos.value, arrowEndPos.value, ctx, lineColor.value, lineWidth.value)
  } else if (isDrawing.value && edit.isFreehandMode && points.value.length >= 2) {
    const currentColor = isEraser.value ? '#ffffff' : lineColor.value
    const currentWidth = isEraser.value ? 20 : lineWidth.value
    const currentStroke = getStroke(points.value, {
      size: currentWidth,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    })
    const originalComposite = ctx.globalCompositeOperation
    if (isEraser.value) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = lineColor.value
    }
    ctx.beginPath()
    if (currentStroke.length > 0) {
      ctx.moveTo(currentStroke[0][0], currentStroke[0][1])
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i][0], currentStroke[i][1])
      }
    }
    ctx.fill()
    if (isEraser.value) {
      ctx.globalCompositeOperation = originalComposite
    }
  }
  ctx.restore()
}

const drawGrid = () => {
  if (!drawCtx.value || !canvasRef.value) {
    return
  }
  const rect = canvasRef.value.getBoundingClientRect()
  const ctx = drawCtx.value
  const originalComnposite = ctx.globalCompositeOperation

  ctx.globalCompositeOperation = 'source-over'

  if (edit.showGrid) {
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    const gridSize = 20
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
  }

  if (edit.showLayoutGrid) {
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2
    const layoutSize = 100
    for (let y = 0; y < rect.height; y += layoutSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }
    for (let x = 0; x < rect.width; x += layoutSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
  }
  ctx.globalCompositeOperation = originalComnposite
}

const drawOtherLines = (lines: DrawLine[], ctx: CanvasRenderingContext2D) => {
  lines.forEach((line) => {
    if (line.isBackground) return

    // 保存原始的混合模式和样式
    const originalComnposite = ctx.globalCompositeOperation
    const originalFillStyle = ctx.fillStyle
    const originalWidth = ctx.lineWidth
    if (line.isArrow && line.startPos && line.endPos) {
      ctx.globalCompositeOperation = 'source-over'
      drawSingleArrow(line.startPos, line.endPos, ctx, line.color, line.width)
    } else if (line.points.length >= 2) {
      const lineColor = line.isEraser ? `rgba(0, 0, 0, 1)` : line.color
      const lineWidth = line.isEraser ? 20 : line.width

      if (line.isEraser) {
        ctx.globalCompositeOperation = 'destination-out'
      } else {
        ctx.globalCompositeOperation = 'source-over'
      }
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
    }

    ctx.globalCompositeOperation = originalComnposite
    ctx.fillStyle = originalFillStyle
    ctx.lineWidth = originalWidth
  })
}

const stopDraw = () => {
  if (edit.isArrowMode && isDrawingArrow.value) {
    isDrawingArrow.value = false
    if (arrowStartPos.value && arrowEndPos.value) {
      const start = arrowStartPos.value
      const end = arrowEndPos.value
      const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      if (distance > 5) {
        // 记得在这里清除已经废弃的历史记录
        let newHistory = edit.drawHistory.slice(0, edit.historyIndex + 1)
        const backgroundIndex = newHistory.findIndex((line) => line.isBackground)
        if (backgroundIndex !== -1) {
          newHistory = newHistory.slice(0, backgroundIndex + 1)
        }
        const arrowLine: DrawLine = {
          points: [],
          color: lineColor.value,
          width: lineWidth.value,
          isEraser: false,
          isArrow: true,
          startPos: start,
          endPos: end,
        }
        newHistory.push(arrowLine)
        edit.drawHistory = newHistory
        edit.historyIndex = newHistory.length - 1 // 指向新的记录

        saveCurrentState()
      }
    }
    arrowStartPos.value = null
    arrowEndPos.value = null
  } else if (isDrawing.value && edit.isFreehandMode) {
    isDrawing.value = false
    if (points.value.length >= 2) {
      let newHistory = edit.drawHistory.slice(0, edit.historyIndex + 1)
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
      edit.drawHistory = newHistory
      edit.historyIndex = newHistory.length - 1
    }
    if (drawCanvasRef.value && canvasRef.value) {
      const containerRect = canvasRef.value.getBoundingClientRect()
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
        edit.setCanvasDrawData(edit.viewport, dataUrl)
      }
    }
    points.value = []
  }
}

const drawSingleArrow = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
) => {
  const headLength = width * 4 // 箭头头部长度（按线宽4倍自适应）
  const angle = Math.atan2(end.y - start.y, end.x - start.x) // 计算直线角度

  // 1. 绘制箭头主线
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()

  // 2. 绘制箭头头部（三角形填充）
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(end.x, end.y) // 箭头终点（三角形顶点）
  // 箭头头部左端点
  ctx.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6),
  )
  // 箭头头部右端点
  ctx.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6),
  )
  ctx.closePath()
  ctx.fill()
}

const undo = () => {
  if (canUndo.value) {
    edit.historyIndex--
    drawPoints()
    saveCurrentState()
  }
}

const redo = () => {
  if (canRedo.value) {
    edit.historyIndex++
    drawPoints()
    saveCurrentState()
  }
}

// 保存当前的画布状态
const saveCurrentState = () => {
  if (drawCanvasRef.value && canvasRef.value) {
    const containerRect = canvasRef.value.getBoundingClientRect()
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
      edit.setCanvasDrawData(edit.viewport, dataUrl)
    }
  }
}

const canUndo = computed(() => edit.historyIndex >= 0)
const canRedo = computed(() => edit.historyIndex < edit.drawHistory.length - 1)

// 事件处理
const getDrawPos = (e: MouseEvent | TouchEvent): { x: number; y: number; pressure: number } => {
  if (!canvasRef.value) return { x: 0, y: 0, pressure: 0.5 }

  const container = canvasRef.value
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
  x -= canvasState.viewportOffsetX
  y -= canvasState.viewportOffsetY
  return { x, y, pressure }
}

const startDraw = (e: MouseEvent) => {
  if (edit.isArrowMode) {
    const pos = getDrawPos(e)
    isDrawingArrow.value = true
    arrowStartPos.value = { x: pos.x, y: pos.y }
    arrowEndPos.value = { x: pos.x, y: pos.y }
    drawPoints()
  } else if (edit.isFreehandMode) {
    isDrawing.value = true
    points.value = [getDrawPos(e)]
    drawPoints()
  }
}

const startDrawTouch = (e: TouchEvent) => {
  e.preventDefault()
  if (e.touches.length === 0) return
  const pos = getDrawPos(e)
  if (edit.isArrowMode) {
    isDrawingArrow.value = true
    arrowStartPos.value = { x: pos.x, y: pos.y }
    arrowEndPos.value = { x: pos.x, y: pos.y }
    drawPoints()
  } else if (edit.isFreehandMode) {
    isDrawing.value = true
    points.value = [pos]
    drawPoints()
  }
}

// 使用节流对绘画操作进行更新,限制绘画频率
const throttledDrawPoints = throttle(() => {
  drawPoints()
}, 16)

const drawing = (e: MouseEvent | TouchEvent) => {
  if (edit.isArrowMode && isDrawingArrow.value) {
    const pos = getDrawPos(e)
    arrowEndPos.value = { x: pos.x, y: pos.y }
    throttledDrawPoints() // 节流绘制
  } else if (edit.isFreehandMode && isDrawing.value && drawCtx.value) {
    points.value.push(getDrawPos(e))
    throttledDrawPoints()
  }
}

const drawingTouch = (e: TouchEvent) => {
  e.preventDefault()
  drawing(e)
}

const clearAllDraw = () => {
  if (!drawCtx.value || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  drawCtx.value.clearRect(0, 0, rect.width, rect.height)
  edit.drawHistory = []
  edit.historyIndex = -1
  points.value = []
  edit.setCanvasDrawData(edit.viewport, '')
}

const getElementStyle = (element: BaseBlock) => {
  const baseStyle: Record<string, any> = {
    position: 'absolute',
    left: `${(element.x ?? 100) + canvasState.viewportOffsetX}px`,
    top: `${(element.y ?? 100) + canvasState.viewportOffsetY}px`,
    width: element.width ? `${element.width}` : 'auto',
    height: element.height ? `${element.height}` : 'auto',
    cursor: edit.isPreview ? 'default' : 'grab',
    transform: `scale(${edit.zoomRatio / 100})`,
    transformOrigin: `top left`,
    ...getRemoteHighlightStyle(element.id),
  }
  if (!edit.isPreview) {
    baseStyle.zIndex = edit.currentSelect?.id === element.id ? 100 : 10
  }
  return baseStyle
}

const renderComponentCode = computed(() => {
  return (element: { code: string; type?: string }) => {
    if (element.type === 'el') return element.code
    return COMPONENT_PREFIX + '-' + element.code
  }
})

const activeClass = computed(() => {
  return (element: BaseBlock) => {
    return { 'is-active': element.id === edit.currentSelect?.id }
  }
})

const getComponentValues = (defaultValue: any) => {
  const defaultKeys = Object.keys(defaultValue)
  const target: Record<string, any> = {}
  defaultKeys.forEach((key) => {
    target[key] = defaultValue[key][edit.viewport]
  })
  return target
}

// 修复：添加return，确保占位符组件正常显示
const getPluginComponent = (pluginId: string) => {
  const component = pluginManager.getComponent(pluginId)
  if (component) return component
  console.log(`插件未加载：${pluginId}`)
  return {
    name: 'PluginPlaceholder',
    setup() {
      return () => {
        // 修复：添加return
        return h(
          'div',
          {
            class: 'plugin-placeholder',
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60px',
              background: '#fff3cd',
              border: '1px dashed #ffeaa7',
              color: '#856404',
              fontSize: '14px',
              borderRadius: '4px',
            },
          },
          `插件：${pluginId}未加载`,
        )
      }
    },
  }
}

const getRemoteHighlightStyle = (blockId: string) => {
  const selections = Object.values(collabStore.remoteSelections).filter(
    (sel) => sel.blockId === blockId,
  )
  if (selections.length === 0) return {}
  const color = selections[0].color
  return {
    outline: `2px solid ${color}`,
    outlineOffset: '2px',
  }
}

// 修复：将initInteract和retryInit提到外面，让watch能访问
const initInteract = () => {
  if (edit.isPreview || !canvasRef.value) return
  interact('.element').unset()
  interact('.element:not(.preview-disabled)').draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: false as any,
        endOnly: false,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
      }),
      interact.modifiers.snap({
        targets: [interact.createSnapGrid({ x: 10, y: 10 })],
        range: 7,
        endOnly: false,
        relativePoints: [{ x: 0, y: 0 }],
      }),
    ],
    listeners: {
      start() {
        if (edit.isPreview) return // 双重保险：防止模式切换时仍触发
        document.body.style.cursor = 'grabbing'
      },
      move(event) {
        if (edit.isPreview) return // 双重保险
        const target = event.target as HTMLElement
        const id = target.dataset.id
        if (!id) return
        const updateBlock = (blocks: BaseBlock[]): BaseBlock[] => {
          return blocks.map((block) => {
            if (block.id === id) {
              return {
                ...block,
                x: (block.x || 0) + event.dx, // 仅累加鼠标dx
                y: (block.y || 0) + event.dy, // 仅累加鼠标dy
              }
            }
            if (block.children && block.nested) {
              return {
                ...block,
                children: block.children.map((childList) => updateBlock(childList)),
              }
            }
            return block
          })
        }
        const newList = updateBlock(props.list)
        emit('update:list', newList)
      },
      end() {
        document.body.style.cursor = ''
      },
    },
  })
}

const retryInit = (count = 0) => {
  nextTick(() => {
    if (document.querySelector('.element:not(.preview-disabled)') || count >= 3) {
      initInteract()
    } else if (count < 3) {
      setTimeout(() => retryInit(count + 1), 50)
    }
  })
}

// 修复：删除重复的hanleElementClick，在正确的函数里添加预览判断
const handleElementClick = (element: BaseBlock) => {
  if (edit.isPreview) return // 预览模式禁用选中
  edit.setCurrentSelect(element)
}

const findNodeById = (arr: BaseBlock[], nodeId: string, callback: (params: any) => void) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === nodeId) {
      callback({ array: arr, node: arr[i], index: i })
      return true
    }
    if (arr[i].children) {
      for (const childList of arr[i].children as any) {
        if (findNodeById(childList, nodeId, callback)) return true
      }
    }
  }
  return false
}

const replaceNodeId = (node: BaseBlock): BaseBlock => {
  return JSON.parse(JSON.stringify(node).replace(/"id":"[^"]+"/g, `"id":"${Date.now()}"`))
}

// 修复：预览模式禁用复制
const copy = (id: string) => {
  if (edit.isPreview) return
  const newList = JSON.parse(JSON.stringify(props.list))
  findNodeById(newList, id, ({ array, node, index }) => {
    array.splice(index, 0, replaceNodeId(node))
  })
  emit('update:list', newList)
  edit.setCurrentSelect(null)
}

// 修复：预览模式禁用删除
const clear = (id: string) => {
  if (edit.isPreview) return
  const newList = JSON.parse(JSON.stringify(props.list))
  findNodeById(newList, id, ({ array, index }) => {
    array.splice(index, 1)
  })
  emit('update:list', newList)
  edit.setCurrentSelect(null)
}

watch(
  () => edit.isPreview,
  (isPreview) => {
    if (isPreview) {
      interact('.element').unset()
      document.body.style.cursor = ''
    } else {
      nextTick(() => retryInit()) // 修复：用nextTick确保DOM更新后初始化
    }
  },
)

watch(
  () => edit.isPreview,
  (isPreview) => {
    if (!isPreview) {
      nextTick(() => initDrawCanvas())
    }
  },
)

watch(
  () => edit.viewport,
  () => {
    if (!edit.isPreview) {
      setTimeout(initDrawCanvas, 0)
    }
  },
)

watch([lineColor, lineWidth], () => {
  if (drawCtx.value && !isEraser.value) {
    drawCtx.value.strokeStyle = lineColor.value
    drawCtx.value.lineWidth = lineWidth.value
  }
})

watch(
  () => edit.isFreehandMode,
  (newMode, oldMode) => {
    if (!newMode && oldMode) {
      if (isDrawing.value) {
        stopDraw()
      }
      saveCurrentState()
    }
    if (newMode && !oldMode && !edit.isPreview) {
      isDrawing.value = false
      if (drawCtx.value) {
        drawCtx.value.strokeStyle = lineColor.value
        drawCtx.value.lineWidth = lineWidth.value
      }
      nextTick(() => {
        initDrawCanvas()
      })
    }
  },
  { immediate: true },
)

watch(
  () => edit.isEraserMode,
  (isActive) => {
    isDrawing.value = false
    isEraser.value = isActive
    if (drawCtx.value) {
      if (isActive) {
        drawCtx.value.globalCompositeOperation = 'destination-out'
        drawCtx.value.fillStyle = 'rgba(0, 0, 0, 1)'
        drawCtx.value.lineWidth = 20
      } else {
        drawCtx.value.globalCompositeOperation = 'source-over'
        drawCtx.value.strokeStyle = lineColor.value
        drawCtx.value.fillStyle = lineColor.value
        drawCtx.value.lineWidth = lineWidth.value
      }
    }
  },
  { immediate: true },
)

watch(
  () => edit.isArrowMode,
  (isActive) => {
    isDrawing.value = false
    isDrawingArrow.value = false
    points.value = []
    arrowStartPos.value = null
    arrowEndPos.value = null
    if (isActive) {
      if (drawCtx.value) {
        drawCtx.value.strokeStyle = lineColor.value
        drawCtx.value.lineWidth = lineWidth.value
      }
      nextTick(() => {
        initDrawCanvas()
      })
    } else {
      drawPoints()
    }
  },
  { immediate: true },
)

watch(
  () => edit.zoomRatio,
  (radio) => {
    if (drawCanvasRef.value && drawCtx.value) {
      const scale = radio / 100
      drawCtx.value.setTransform(scale, 0, 0, scale, 0, 0)
      drawPoints()
    }
  },
  { immediate: true },
)

watch(
  [() => edit.showGrid, () => edit.showLayoutGrid],
  () => {
    drawGrid()
    drawPoints()
  },
  { immediate: true },
)

watch(
  () => props.list,
  (newList) => {
    const result: BaseBlock[] = []
    const traverse = (items: BaseBlock[]) => {
      items.forEach((item) => {
        result.push(item)
        if (item.children && item.nested) {
          item.children.forEach((childList) => {
            traverse(childList)
          })
        }
      })
    }
    traverse(newList)
    flattenedListRef.value = result
  },
  { immediate: true },
)

watch(
  () => props.list,
  (newList) => {
    const map = new Map()
    const traverse = (items: BaseBlock[], parentArray: BaseBlock[]) => {
      items.forEach((item, index) => {
        map.set(item.id, { array: parentArray, index })
        if (item.children && item.nested) {
          item.children.forEach((childList) => traverse(childList, childList))
        }
      })
    }
    traverse(newList, newList)
    nodeMap.value = map
  },
  { immediate: true },
)

onMounted(() => {
  edit.setCanvasInstance({
    undo,
    redo,
    clearAllDraw,
  })
  if (!edit.isPreview) {
    nextTick(() => {
      initDrawCanvas()
      retryInit()
    })
  }
  if (canvasRef.value) {
    canvasRef.value.addEventListener('mousedown', handleCanvasMouseDown)
    window.addEventListener('mousemove', handleCanvasMouseMove)
    window.addEventListener('mouseup', handleCanvasMouseUp)
  }
})

onUnmounted(() => {
  interact('.element').unset()
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', handleCanvasMouseDown)
  }
  window.removeEventListener('mousemove', handleCanvasMouseMove)
  window.removeEventListener('mouseup', handleCanvasMouseUp)
})
</script>

<style scoped lang="scss">
/* 新增：顶部工具层样式 */
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

.edit-render-drag {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f9fafb;

  &:not(.is-preview) {
    background-color: #f8f9fa;
    background-image:
      radial-gradient(circle, #b0b0b0 1.5px, transparent 1.5px),
      radial-gradient(circle, #ced4da 1px, transparent 1px);
    background-size:
      50px 50px,
      10px 10px;
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

  &.is-preview {
    pointer-events: auto;
    background-image: none;
  }

  .element {
    user-select: none;
    border: 2px solid transparent;
    transition: outline 0.2s;

    &:active {
      cursor: grabbing !important;
    }

    &.preview-disabled {
      cursor: default !important;
      pointer-events: auto;
      user-select: auto;
    }
  }
}

.element {
  position: absolute;
  user-select: none;
  z-index: 10;
}

.freehand-overlay {
  position: absolute;
  top: 60px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 60px);
  pointer-events: auto;
  z-index: 20;
}

.nested-item {
  border: 1px solid var(--color-edit-render-block-border);
  background: var(--color-edit-render-block-bg);
  height: 100%;
  min-height: inherit;

  & + .nested-item {
    border-left: 0;
  }
}

.block-nested-render,
.block-render {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.block-nested-render {
  &:hover,
  &.is-active {
    border: 1px dashed var(--color-edit-render-block-border-hover);
  }
}

.block-render {
  position: relative;

  &:not(.preview-mode) {
    &:hover,
    &.is-active {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px dashed var(--color-edit-render-block-border-hover);
      }
    }
  }
}

.plugin-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #fff3cd;
  border: 1px dashed #ffeaa7;
  color: #856404;
  font-size: 14px;
  border-radius: 4px;
}
</style>
