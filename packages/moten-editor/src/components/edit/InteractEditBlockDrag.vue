<template>
  <div class="edit-block-drag">
    <div
      v-for="element in list"
      :key="element.id"
      class="block-item"
      draggable="true"
      @dragstart="onDragStart($event, element)"
      @click="onClick(element)"
    >
      <v-icon class="block-icon" :icon="element.icon" />
      <div class="block-name" v-html="element.name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit'
import type { BaseBlock } from '@/types/edit'

const edit = useEditStore()

const props = defineProps({
  list: {
    type: Array as () => BaseBlock[],
    required: true,
    default: () => [],
  },
})

// 拖拽开始：设置拖拽数据（传递组件信息）
const onDragStart = (event: DragEvent, element: BaseBlock) => {
  if (!event.dataTransfer) return

  // 克隆一份新数据（避免引用）
  const cloned = JSON.parse(JSON.stringify(element))
  // 设置默认位置（后续可优化为鼠标位置）
  cloned.x = 100
  cloned.y = 100
  cloned.width = cloned.width || 200
  cloned.height = cloned.height || 100

  // 通过 dataTransfer 传递 JSON 字符串
  event.dataTransfer.setData('application/json', JSON.stringify(cloned))
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setDragImage(createDragImage(element.name), 0, 0)
}

// 点击也触发添加（方便移动端或不想拖拽的用户）
const onClick = (element: BaseBlock) => {
  const cloned = JSON.parse(JSON.stringify(element))
  cloned.x = 100
  cloned.y = 100
  cloned.width = cloned.width || 200
  cloned.height = cloned.height || 100
  edit.addBlock(cloned) // 👈 需要在 store 中新增方法
}

const createDragImage = (name: string): HTMLElement => {
  const el = document.createElement('div')

  el.innerHTML = `
    <div class="drag-container">
      <div class="drag-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
      <div class="drag-divider"></div>
      <div class="drag-content">
        <div class="drag-label">添加组件</div>
        <div class="drag-name">${name}</div>
      </div>
      <div class="drag-action">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  `

  el.style.cssText = `
    pointer-events: none;
    width: 200px;
    padding: 8px 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #36bffA 0%, #2584f0 100%);
    box-shadow: 0 4px 12px rgba(37, 132, 240, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    transform: scale(0.98);
  `

  // 内部元素样式
  const style = document.createElement('style')
  style.textContent = `
    .drag-container {
      display: flex;
      align-items: center;
      height: 100%;
    }
    
    .drag-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }
    
    .drag-divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 12px;
    }
    
    .drag-content {
      flex: 1;
      padding-right: 12px;
    }
    
    .drag-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2px;
    }
    
    .drag-name {
      font-size: 14px;
      font-weight: 500;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .drag-action {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.1);
    }
  `
  el.appendChild(style)

  document.body.appendChild(el)
  return el
}
</script>

<style scoped lang="scss">
.edit-block-drag {
  display: flex;
  flex-wrap: wrap;

  .block-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: grab;
    width: 33.333%;
    aspect-ratio: 1 / 1;
    text-align: center;
    padding: 10px;
    border-radius: var(--border-radius);

    &:active {
      cursor: grabbing;
    }

    &:hover {
      background: var(--color-block-hover);
      border: 1px solid var(--color-border);
    }

    .block-icon {
      width: 20px;
      height: 20px;
      margin: 0 auto;
    }

    .block-name {
      font-size: 14px;
      line-height: 14px;
      padding-top: 4px;
      white-space: nowrap;
    }
  }
}
</style>
