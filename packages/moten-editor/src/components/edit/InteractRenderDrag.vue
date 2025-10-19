<template>
  <div class="edit-render-drag" ref="canvasRef" :class="{ 'is-preview': edit.isPreview }">
    <div
      v-for="element in props.list"
      :key="element.id"
      :data-id="element.id"
      class="element"
      :style="getElementStyle(element)"
      @mouseenter="hoverId = element.id"
      @mouseleave="hoverId = ''"
      @click="handleElementClick(element)"
    >
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
import { computed, h, onMounted, onUnmounted, ref, nextTick } from 'vue'
import interact from 'interactjs'
import performanceMonitorWrapper from '../performance/performanceMonitorWrapper.vue'
import { nestedClass } from './nested'

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

const getElementStyle = (element: BaseBlock) => {
  const baseStyle: Record<string, any> = {
    position: 'absolute',
    left: `${element.x ?? 100}px`,
    top: `${element.y ?? 100}px`,
    width: element.width ? `${element.width}` : 'auto',
    height: element.height ? `${element.height}` : 'auto',
    cursor: edit.isPreview ? 'default' : 'grab',
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

const getPluginComponent = (pluginId: string) => {
  const component = pluginManager.getComponent(pluginId)
  if (component) return component
  console.log(`插件未加载：${pluginId}`)
  return {
    name: 'PluginPlaceholder',
    setup() {
      return () => {
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

onMounted(() => {
  if (edit.isPreview) {
    return
  }

  const initInteract = () => {
    if (!canvasRef.value) return
    interact('.element').unset()
    interact('.element').draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: canvasRef.value,
          endOnly: false,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        }),
      ],
      listeners: {
        start() {
          document.body.style.cursor = 'grabbing'
        },
        move(event) {
          const target = event.target as HTMLElement
          const id = target.dataset.id
          if (!id) return
          const updateBlock = (blocks: BaseBlock[]): BaseBlock[] => {
            return blocks.map((block) => {
              if (block.id === id) {
                return {
                  ...block,
                  x: (block.x || 0) + event.dx,
                  y: (block.y || 0) + event.dy,
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
      if (document.querySelector('.element') || count >= 3) {
        initInteract()
      } else if (count < 3) {
        setTimeout(() => retryInit(count + 1), 50)
      }
    })
  }

  retryInit()

  // nextTick(() => {
  //   if (!canvasRef.value) return
  //   interact('.element').draggable({
  //     inertia: true,
  //     modifiers: [
  //       interact.modifiers.restrictRect({
  //         restriction: canvasRef.value,
  //         endOnly: false,
  //         elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
  //       }),
  //     ],
  //     listeners: {
  //       start() {
  //         document.body.style.cursor = 'grabbing'
  //       },
  //       move(event) {
  //         const target = event.target as HTMLElement
  //         const id = target.dataset.id
  //         if (!id) return
  //         const updateBlock = (blocks: BaseBlock[]): BaseBlock[] => {
  //           return blocks.map((block) => {
  //             if (block.id === id) {
  //               return {
  //                 ...block,
  //                 x: (block.x || 0) + event.dx,
  //                 y: (block.y || 0) + event.dy,
  //               }
  //             }
  //             if (block.children && block.nested) {
  //               return {
  //                 ...block,
  //                 children: block.children.map((childList) => updateBlock(childList)),
  //               }
  //             }
  //             return block
  //           })
  //         }
  //         const newList = updateBlock(props.list)
  //         emit('update:list', newList)
  //       },
  //       end() {
  //         document.body.style.cursor = ''
  //       },
  //     },
  //   })
  // })
})

onUnmounted(() => {
  interact('.element').unset()
})

const handleElementClick = (element: BaseBlock) => {
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

const copy = (id: string) => {
  const newList = JSON.parse(JSON.stringify(props.list))
  findNodeById(newList, id, ({ array, node, index }) => {
    array.splice(index, 0, replaceNodeId(node))
  })
  emit('update:list', newList)
  edit.setCurrentSelect(null)
}

const clear = (id: string) => {
  const newList = JSON.parse(JSON.stringify(props.list))
  findNodeById(newList, id, ({ array, index }) => {
    array.splice(index, 1)
  })
  emit('update:list', newList)
  edit.setCurrentSelect(null)
}
</script>

<style scoped lang="scss">
.interact-render-drag {
  position: relative;
  width: 100%;
  height: 100%;

  &.is-preview {
    pointer-events: none;
  }

  .element {
    user-select: none;
    border: 2px solid transparent;
    transition: outline 0.2s;

    &:active {
      cursor: grabbing !important;
    }
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
</style>
