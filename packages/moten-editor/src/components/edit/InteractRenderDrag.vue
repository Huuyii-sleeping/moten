<template>
  <div class="top-toolbar" v-if="!edit.isPreview && edit.isFreehandMode">
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
  <div
    class="edit-render-drag"
    ref="canvasRef"
    :class="{ 'is-preview': edit.isPreview }"
    @dragover.prevent
    @drag.prevent="handleDrop"
  >
    <canvas
      v-if="!edit.isPreview && edit.isFreehandMode"
      ref="drawCanvasRef"
      class="freehand-overlay"
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
import { computed, h, onMounted, onUnmounted, ref, nextTick, watch, createTextVNode } from 'vue'
import interact from 'interactjs'
import performanceMonitorWrapper from '../performance/performanceMonitorWrapper.vue'
import { nestedClass } from './nested'
import getStroke from 'perfect-freehand'
import type { DrawLine } from '@/types/canvas'
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
// 扁平化列表 用来统一渲染所有的可拖拽项 包括嵌套
const flattenedList = computed(() => {
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
  traverse(props.list)
  return result
})
// canvas 画笔相关api
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
const viewOffset = ref({ x: 0, y: 0 })
const isDraggingCanvas = ref(false)
const startDragPos = ref({ x: 0, y: 0 })
const dragOverPos = ref({ x: 0, y: 0 })

// 画布组件中新增 handleDrop 方法
const handleDrop = (e: DragEvent) => {
  if (edit.isPreview || !canvasRef.value) return

  // 1. 获取拖拽传递的组件信息
  const componentDataStr = e.dataTransfer!.getData('application/json')
  if (!componentDataStr) return
  const componentData: BaseBlock = JSON.parse(componentDataStr)

  // 2. 计算鼠标释放时在画布中的绝对坐标（关键）
  const canvasRect = canvasRef.value.getBoundingClientRect()
  // 鼠标相对画布容器的坐标 = 鼠标屏幕坐标 - 画布左上角位置
  const relativeX = e.clientX - canvasRect.left
  const relativeY = e.clientY - canvasRect.top
  // 画布绝对坐标 = 相对坐标 + 视图偏移（与视图同步）
  const absoluteX = relativeX + viewOffset.value.x
  const absoluteY = relativeY + viewOffset.value.y

  // 3. 给组件设置正确的坐标
  const newComponent: BaseBlock = {
    ...componentData,
    id: `block-${Date.now()}`, // 生成新ID
    x: absoluteX, // 最终坐标
    y: absoluteY,
  }

  // 4. 添加到画布
  const newList = [...props.list, newComponent]
  emit('update:list', newList)
  edit.setCurrentSelect(newComponent)
}

// 画布鼠标按下：判断是否点击空白区域
const handleCanvasMouseDown = (e: MouseEvent) => {
  // 仅当点击画布空白处（非元素）且非绘制模式时触发
  if (e.target === canvasRef.value && !edit.isFreehandMode && !edit.isPreview) {
    isDraggingCanvas.value = true
    startDragPos.value = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).style.cursor = 'grabbing'
    edit.setCurrentSelect(null) // 取消元素选中
  }
}

// 画布鼠标移动：更新视图偏移
const handleCanvasMouseMove = (e: MouseEvent) => {
  if (isDraggingCanvas.value) {
    const dx = e.clientX - startDragPos.value.x
    const dy = e.clientY - startDragPos.value.y
    // 视图偏移 = 原有偏移 + 鼠标移动距离（实现画布拖动）
    viewOffset.value = {
      x: viewOffset.value.x + dx,
      y: viewOffset.value.y + dy,
    }
    startDragPos.value = { x: e.clientX, y: e.clientY } // 重置起点
  }
}

// 画布鼠标释放：结束拖动
const handleCanvasMouseUp = () => {
  if (isDraggingCanvas.value) {
    isDraggingCanvas.value = false
    canvasRef.value?.style.setProperty('cursor', 'default')
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  // 按住空格+方向键移动视图（模拟Figma）
  if (e.code === 'Space' || e.ctrlKey) return

  const step = e.shiftKey ? 20 : 5 // 按住Shift加速
  switch (e.key) {
    case 'ArrowLeft':
      viewOffset.value.x -= step
      e.preventDefault()
      break
    case 'ArrowRight':
      viewOffset.value.x += step
      e.preventDefault()
      break
    case 'ArrowUp':
      viewOffset.value.y -= step
      e.preventDefault()
      break
    case 'ArrowDown':
      viewOffset.value.y += step
      e.preventDefault()
      break
  }
}

const toggleEraser = (status: boolean) => {
  isEraser.value = status
}

watch([lineColor, lineWidth], () => {
  if (drawCtx.value && !isEraser.value) {
    drawCtx.value.strokeStyle = lineColor.value
    drawCtx.value.lineWidth = lineWidth.value
  }
})

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

  const savedData = edit.canvasDrawData?.[edit.viewport] || ''
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

// 绘制操作
const drawPoints = () => {
  if (!drawCanvasRef.value || !drawCtx.value || !canvasRef.value) return

  const ctx = drawCtx.value
  const containerRect = canvasRef.value.getBoundingClientRect()

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

  // 2. 绘制当前正在画的线条（如果处于绘制中）
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

const canUndo = computed(() => historyIndex.value >= 0)
const canRedo = computed(() => historyIndex.value < drawHistory.value.length - 1)

// 事件处理
const getDrawPos = (e: MouseEvent | TouchEvent): { x: number; y: number; pressure: number } => {
  if (!canvasRef.value) return { x: 0, y: 0, pressure: 0.5 }

  const container = canvasRef.value
  const rect = container.getBoundingClientRect()
  let x = 0,
    y = 0,
    pressure = 0.5

  if (e instanceof MouseEvent) {
    // 画笔坐标 = 鼠标相对画布的位置 + 视图偏移（与元素实际位置对齐）
    x = e.clientX - rect.left + viewOffset.value.x
    y = e.clientY - rect.top + viewOffset.value.y
  } else if (e.touches?.length) {
    const touch = e.touches[0]
    x = touch.clientX - rect.left + viewOffset.value.x
    y = touch.clientY - rect.top + viewOffset.value.y
    pressure = touch.force || 0.5
  }

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
  if (!drawCtx.value || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  drawCtx.value.clearRect(0, 0, rect.width, rect.height)
  drawHistory.value = []
  historyIndex.value = -1
  points.value = []
  edit.setCanvasDrawData(edit.viewport, '')
}

const getElementStyle = (element: BaseBlock) => {
  const baseStyle: Record<string, any> = {
    position: 'absolute',
    left: `${(element.x ?? 0) - viewOffset.value.x}px`,
    top: `${(element.y ?? 0) - viewOffset.value.y}px`,
    width: element.width ? `${element.width}px` : 'auto',
    height: element.height ? `${element.height}px` : 'auto',
    cursor: edit.isPreview ? 'default' : 'grab',
    ...getRemoteHighlightStyle(element.id),
    zIndex: edit.currentSelect?.id === element.id ? 100 : 10,
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
        restriction: canvasRef.value,
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
      nextTick(() => {
        initDrawCanvas()
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  // 绑定画布拖拽事件
  canvasRef.value?.addEventListener('mousedown', handleCanvasMouseDown)
  window.addEventListener('mousemove', handleCanvasMouseMove)
  window.addEventListener('mouseup', handleCanvasMouseUp)
  window.addEventListener('keydown', handleKeyDown)

  // 初始化元素拖拽
  if (!edit.isPreview) {
    nextTick(() => {
      initDrawCanvas()
      retryInit()
    })
  }
})

onUnmounted(() => {
  canvasRef.value?.removeEventListener('mousedown', handleCanvasMouseDown)
  window.removeEventListener('mousemove', handleCanvasMouseMove)
  window.removeEventListener('mouseup', handleCanvasMouseUp)
  window.removeEventListener('keydown', handleKeyDown)
  interact('.element').unset()
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

/* 原有样式调整：给画布容器添加顶部间距，避免被工具层遮挡 */
.edit-render-drag {
  /* 新增：工具层高度约为 50px，这里预留 60px 避免遮挡 */
  padding-top: 60px;
  /* 原有样式不变 */
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

  /* 其他原有样式不变 */
}
.edit-render-drag {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding-top: 60px; // 避开顶部工具栏
  background-color: #f9fafb;
  background-image:
    radial-gradient(circle, #b0b0b0 1.5px, transparent 1.5px),
    radial-gradient(circle, #ced4da 1px, transparent 1px);
  background-size:
    50px 50px,
    10px 10px;
  overflow: hidden; // 隐藏滚动条，通过视图偏移控制显示范围
  cursor: default;

  &.is-preview {
    background-image: none;
  }

  // 画布空白区域样式（区分可拖拽区域）
  &:not(.is-preview):hover {
    cursor: grab;
  }
}

// 元素样式确保层级正确
.element {
  position: absolute;
  user-select: none;
  // 确保元素始终在Canvas之上（如果启用）
  z-index: 10;
}

// Canvas层级调整（绘制时在元素上方，平时在下方）
.freehand-overlay {
  position: absolute;
  top: 60px; // 与工具栏高度对齐
  left: 0;
  width: 100vw;
  height: calc(100vh - 60px);
  pointer-events: auto;
  z-index: 20; // 绘制时覆盖元素
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

// 补充：插件占位符样式（防止未加载时样式错乱）
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
