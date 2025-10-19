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

// 可选：自定义拖拽图标
const createDragImage = (name: string): HTMLElement => {
  const el = document.createElement('div')
  el.textContent = `+ ${name}`
  el.style.cssText = `
    background: #409EFF;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
  `
  document.body.appendChild(el)
  return el
}
</script>

<style scoped lang="scss">
/* 样式完全保留你原有的 */
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
