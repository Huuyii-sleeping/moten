<template>
  <div>
    <draggable
      :list="list"
      :group="group"
      :sort="sort"
      animation="200"
      ghost-class="ghost-class"
      class="edit-render-drag"
      :move="move"
      @click="console.log(list)"
    >
      <template #item="{ element }">
        <div class="element" :style="getRemoteHighlightStyle(element.id) as any">
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
                  <edit-render-drag
                    :key="element.id + '-' + index"
                    :list="item"
                    :level="level + 1"
                    :group="group"
                  >
                  </edit-render-drag>
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
              >
              </component>
            </div>
          </div>
          <div v-else>
            <div
              v-if="element.nested && level < 2"
              class="block-nested-render"
              :class="activeClass(element)"
              @click.stop="edit.setCurrentSelect(element)"
              @mouseenter="hoverId = element.id"
              @mouseleave="hoverId = ''"
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
                  <edit-render-drag
                    :key="element.id + '-' + index"
                    :list="item"
                    :level="level + 1"
                    :group="group"
                    class="nested-item"
                    :class="nestedClass"
                  >
                  </edit-render-drag>
                </template>
              </component>
            </div>
            <div
              v-else-if="element.type"
              class="block-render"
              :class="activeClass(element)"
              @click.stop="edit.setCurrentSelect(element)"
              @mouseenter="hoverId = element.id"
              @mouseleave="hoverId = ''"
            >
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
            <div
              v-else
              class="block-render"
              :class="activeClass(element)"
              @click.stop="edit.setCurrentSelect(element)"
              @mouseenter="hoverId = element.id"
              @mouseleave="hoverId = ''"
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
              >
              </component>
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { findNodeById, move, nestedClass, replaceNodeId } from './nested'
import { useEditStore } from '@/stores/edit'
import type { BaseBlock } from '@/types/edit'
import { COMPONENT_PREFIX } from '@/config'
import { useCollaborationStore } from '@/stores/collaborationStore'
import pluginManager from '@/utils/pluginManager'
const edit = useEditStore()
defineOptions({
  name: 'edit-render-drag',
})
const props = defineProps({
  list: {
    type: Array,
    required: true,
    default: () => [],
  },
  group: {
    type: [String, Object],
    default: 'group',
  },
  sort: {
    type: Boolean,
    default: true,
  },
  level: {
    type: Number,
    default: 1,
  },
})
const hoverId = ref('')
const getPluginComponent = (pluginId: string) => {
  console.log(pluginId)
  const component = pluginManager.getComponent(pluginId)
  if (component) return component
  console.warn(`插件未加载：${pluginId}`)
  return {
    name: 'PluginPlaceholder',
    setup() {
      return () =>
        h(
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
          `插件 "${pluginId}" 未加载`,
        )
    },
  }
}
const renderComponentCode = computed(() => {
  return (element: { code: string; type: string }) => {
    if (element.type) {
      if (element.type === 'el') {
        return element.code
      } else if (element.type === 'plugin') {
      }
    }
    return COMPONENT_PREFIX + '-' + element.code
  }
})
const activeClass = computed(() => {
  return (element: BaseBlock) => {
    const id = edit.currentSelect?.id || ''
    return { 'is-active': element.id === id }
  }
})

const getComponentValues = (defaultValue: any) => {
  const defaultKeys = Object.keys(defaultValue)
  let target: Record<string, any> = {}
  defaultKeys.forEach((key) => {
    target[key] = defaultValue[key][edit.viewport]
  })
  return target
}

const handleNodeById = (arr: BaseBlock[], nodeId: string, type: 'copy' | 'clear') => {
  return findNodeById(arr, nodeId, (params) => {
    const { array, node, index } = params
    if (type === 'copy') array.splice(index, 0, replaceNodeId(node))
    if (type === 'clear') array.splice(index, 1)
  })
}

const copy = (id: string) => {
  if (!edit.blockConfig?.length) return
  const newBlockConfig = handleNodeById(edit.blockConfig, id, 'copy')
  edit.setCurrentSelect({} as any)
  edit.setBlockConfig(newBlockConfig)
}

const clear = (id: string) => {
  if (!edit.blockConfig?.length) return
  const newBlockConfig = handleNodeById(edit.blockConfig, id, 'clear')
  edit.setCurrentSelect({} as any)
  edit.setBlockConfig(newBlockConfig)
}

const collabStore = useCollaborationStore()

const getRemoteHighlightStyle = (blockId: string) => {
  const selections = Object.values(collabStore.remoteSelections).filter(
    (sel) => sel.blockId === blockId,
  )
  if (selections.length === 0) return {}
  const color = selections[0].color
  return {
    outline: `2px solid ${color}`,
    outlineOffset: '2px',
    position: 'relative',
  }
}
</script>

<style scoped lang="scss">
.remote-highlight {
  outline: 2px solid #4da6ff;
  outline-offset: 2px;
}
.edit-render-drag {
  height: 100%;

  .element {
    position: relative;
  }
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
    // 注意不能像block-render做成after，否则组件无法拖入嵌套容器里
    border: 1px dashed var(--color-edit-render-block-border-hover);
  }
}

.block-render {
  position: relative;

  // 仅在编辑模式下显示遮罩
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
</style>
