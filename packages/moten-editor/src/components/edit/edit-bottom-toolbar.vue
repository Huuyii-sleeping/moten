<template>
  <div class="toolbar">
    <!-- 左侧工具按钮组 -->
    <div class="toolbar-group left-group">
      <button
        class="tool-btn"
        title="pen"
        @click="penClick($event)"
        :class="{ active: edit.isFreehandMode }"
      >
        <v-icon icon="pen" class="icon"></v-icon>
      </button>
      <button
        class="tool-btn"
        title="eraser"
        @click="eraserClick($event)"
        :class="{ active: edit.isEraserMode }"
      >
        <v-icon icon="eraser" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="clear" @click="clearClick($event)">
        <v-icon icon="clear" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="stickyNote" @click="stickyNodeClick()">
        <v-icon icon="sticky" class="icon"></v-icon>
      </button>
      <button
        class="tool-btn"
        title="arrow"
        @click="arrowClick($event)"
        :class="{ active: edit.isArrowMode }"
      >
        <v-icon icon="arrow" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="undo" @click="undoClick()" :disabled="!edit.canUndo">
        <v-icon icon="undo" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="redo" @click="redoClick()" :disabled="!edit.canRedo">
        <v-icon icon="redo" class="icon"></v-icon>
      </button>
    </div>

    <!-- 中间信息区域 -->
    <div class="middle-info">
      <span>1 个页面</span>
      <span class="separator">•</span>
      <span>{{ edit.zoomRatio }}% 缩放</span>
    </div>

    <!-- 右侧控制区域 -->
    <div class="toolbar-group right-group">
      <!-- 显示网格：active绑定showGrid -->
      <button
        class="tool-btn"
        title="显示网格 (Shift+G)"
        @click="toggleGrid"
        :class="{ active: edit.showGrid }"
      >
        <v-icon icon="grid" class="icon"></v-icon>
      </button>
      <!-- 布局网格：active绑定showLayoutGrid -->
      <div class="separator"></div>
      <!-- 缩小 -->
      <button class="zoom-btn" title="缩小" @click="handleZoomOut">
        <v-icon icon="subtract" class="icon"></v-icon>
      </button>
      <!-- 缩放输入框：绑定Store的zoomRatio -->
      <div class="zoom-input">
        <input type="text" :value="edit.zoomRatio + '%'" readonly />
      </div>
      <!-- 放大 -->
      <button class="zoom-btn" title="放大" @click="handleZoomIn">
        <v-icon icon="add" class="icon"></v-icon>
      </button>
      <!-- 适应屏幕 -->
      <button class="tool-btn" title="适应屏幕 (Shift+1)" @click="handleZoomToFit">
        <v-icon icon="screen" class="icon"></v-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit'
import type { BaseBlock } from '@/types/edit'

const edit = useEditStore()
const penClick = (e: MouseEvent) => {
  edit.toggleFreehandMode()
}
const eraserClick = (e: MouseEvent) => {
  edit.toggleEraserMode()
}
const clearClick = (e: MouseEvent) => {
  edit.resetToolMode()
  edit.canvasInstance.clearAllDraw()
  edit.setCanvasDrawData(edit.viewport, '')
}
const stickyNodeClick = () => {
  edit.addBlock({
    id: '',
    code: 'stickyNote',
    name: 'stickyNote',
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    content: '新建便签',
    style: { backgroundColor: '#fff9c4', borderRadius: 8, padding: 16 },
  } as BaseBlock)
}
const arrowClick = (e: MouseEvent) => {
  edit.toggleArrowMode()
}
const undoClick = () => {
  if (edit.canUndo) {
    edit.canvasInstance.undo()
  }
}
const redoClick = () => {
  if (edit.canRedo) {
    edit.canvasInstance.redo()
  }
}
const handleZoomIn = () => edit.zoomIn()
const handleZoomOut = () => edit.zoomOut()
const handleZoomToFit = () => edit.zoomToFit()

const toggleGrid = () => {
  edit.toggleShowGrid()
}
</script>

<style scoped lang="scss">
.toolbar {
  position: fixed;
  bottom: 16px; /* 底部间距营造营造浮空感 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  min-width: 600px;
  max-width: 900px; /* 限制最大宽度 */
  height: 44px;
  background-color: rgba(255, 255, 255, 0.95); /* 半透明透明背景 */
  border-radius: 8px; /* 圆角增强浮空感 */
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1); /* 多层次层阴影增强立体感 */
  backdrop-filter: blur(8px); /* 背景模糊增强通透感 */
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.12),
      0 2px 4px rgba(0, 0, 0, 0.08); /* 悬停时阴影加深 */
  }
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.left-group {
  margin-right: auto;
}

.right-group {
  margin-left: auto;
}

.middle-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6b7280;
  font-size: 12px;
  width: 160px;
  margin: 0 10px;
  padding: 0 12px;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
}

.middle-info .separator {
  color: #d1d5db;
}

.tool-btn {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-1px); /* 轻微上浮效果 */
  }

  &.active {
    background-color: #e8f3ff;
    color: #2563eb;
  }

  &:active {
    transform: translateY(0);
    background-color: #e0e0e0;
  }
  &:disabled {
    color: #9ca3af; /* 文字颜色变浅 */
    cursor: not-allowed; /* 鼠标样式改为禁止 */
    opacity: 0.7; /* 整体透明度降低 */
    // 禁用hover和active的交互反馈
    &:hover {
      background-color: transparent; /* 取消hover背景色 */
      transform: translateY(0); /* 取消上浮效果 */
    }
    &:active {
      background-color: transparent; /* 取消点击背景色 */
    }
    // 若有active类，禁用选中样式
    &.active {
      background-color: transparent;
      color: #9ca3af;
    }
  }
  .icon {
    width: 100%;
    height: 100%;
  }
}

.zoom-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  background: transparent;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background-color: #e8e8e8;
  }
}

.zoom-input {
  width: 60px;
  margin: 0 3px;

  input {
    width: 100%;
    height: 30px;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
    background: transparent;
    text-align: center;
    font-size: 12px;
    color: #374151;
    outline: none;

    &:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 1px #93c5fd;
    }
  }
}

.separator {
  width: 1px;
  height: 20px;
  background-color: #f0f0f0;
  margin: 0 8px;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .toolbar {
    min-width: auto;
    padding: 0 12px;
  }

  .middle-info {
    margin: 0 8px;
    padding: 0 8px;
  }
}
</style>
