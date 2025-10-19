<template>
  <div class="preview-render" :class="{ 'is-mobile': edit.isMobileViewport }">
    <div
      v-for="element in flattenedList"
      :key="element.id"
      class="preview-element"
      :style="getElementStyle(element)"
    >
      <!-- 渲染组件（无编辑态逻辑） -->
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
      <div v-else-if="element.type">
        <component
          :is="element.type === 'el' ? element.code : getPluginComponent(element.code)"
          v-bind="getComponentValues(element.formData)"
        />
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

const renderComponentCode = (element: { code: string; type?: string }) => {
  if (element.type === 'el') return element.code
  return COMPONENT_PREFIX + '-' + element.code
}

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

<style scoped>
.preview-render {
  position: relative;
  width: 100%;
  min-height: 100%;
}
.preview-element {
  /* 预览模式无编辑态样式 */
  pointer-events: none; /* 禁用所有交互 */
}
</style>
