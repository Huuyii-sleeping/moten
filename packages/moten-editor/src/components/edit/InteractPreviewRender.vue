<template>
  <div
    class="preview-render"
    :class="{ 'is-preview': edit.isPreview }"
  >
    <div
      v-for="element in flattenedList"
      :key="element.id"
      class="preview-element"
      :style="getElementStyle(element)"
    >
      <div v-if="element.nested && level < 2">
        <component
          :is="renderComponentCode(element)"
          :data="element.formData"
          :viewport="edit.viewport"
          :children="element.children"
        >
          <template #default="{ item, index }">
            <PreviewRender :list="item" :level="level + 1" class="nested-item" />
          </template>
        </component>
      </div>
      <!-- 修复 el 组件渲染逻辑 -->
      <div v-else-if="element.type">
        <div v-if="element.type === 'el'">
          <component
            :is="renderComponentCode(element)"
            v-bind="getComponentValues(element.formData)"
            :value="getComponentValues(element.formData)['content']"
            :disabled="true"
          >
            <!-- 提供插槽内容，确保组件有文本显示 -->
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
          :data="element.formData"
          :viewport="edit.viewport"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit'
import type { BaseBlock } from '@/types/edit'
import pluginManager from '@/utils/pluginManager'
import { COMPONENT_PREFIX } from '@moten/ui'
import { computed } from 'vue'

const props = defineProps<{
  list: BaseBlock[]
  level?: number
}>()

const edit = useEditStore()
const level = props.level || 1

// 扁平化列表（预览不需要拖拽，但需正确渲染嵌套）
const flattenedList = computed(() => {
  const result: BaseBlock[] = []
  const traverse = (items: BaseBlock[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children && item.nested) {
        item.children.forEach((childList) => traverse(childList))
      }
    })
  }
  traverse(props.list)
  return result
})

const getElementStyle = (element: BaseBlock): any => {
  return {
    position: 'absolute',
    left: `${element.x ?? 0}px`,
    top: `${element.y ?? 0}px`,
    width: element.width ? `${element.width}px` : 'auto',
    height: element.height ? `${element.height}px` : 'auto',
  }
}

// 预览组件中修改 renderComponentCode，对齐编辑组件
const renderComponentCode = computed(() => {
  return (element: { code: string; type?: string }) => {
    if (element.type === 'el') return element.code // 确保 el 组件名正确返回
    return COMPONENT_PREFIX + '-' + element.code
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

const getPluginComponent = (pluginId: string) => {
  return pluginManager.getComponent(pluginId) || 'div'
}
</script>

<style scoped lang="scss">
.preview-render {
  position: relative;
  width: 100%;
  min-height: 100vh; // 确保有足够高度
  background-color: #ffffff; // 白色背景，避免组件和背景融合

  &:not(.is-preview) {
    background-color: #f8f9fa;
    background-image:
      radial-gradient(circle, #b0b0b0 1.5px, transparent 1.5px),
      radial-gradient(circle, #ced4da 1px, transparent 1px);
    background-size:
      50px 50px,
      10px 10px;
  }
}
.preview-element {
  position: absolute;
  z-index: 1; // 基础层级，避免被覆盖
  pointer-events: none;
  /* 给组件添加轻微边框，方便调试是否渲染成功 */
  border: 1px solid transparent;
}
</style>
