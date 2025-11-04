<template>
  <div class="edit-render" :class="pageClass" @dragover.prevent @drop="onDrop">
    <InteractRenderDrag v-model:list="list" :level="1" class="render" />
    <el-empty class="empty" v-if="!list?.length" description="请将左侧的组件拖入到此处">
      <template #image>
        <v-icon icon="dragBlank" class="icon"></v-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit'
import { useUserStore } from '@/stores/user'
import type { BaseBlock } from '@/types/edit'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPageList } from './utils/nested'
import InteractRenderDrag from './InteractRenderDrag.vue'

const route = useRoute()
const edit = useEditStore()
const useUser = useUserStore()

const list = ref<BaseBlock[]>([]) as any
const allPages = useUser.list
getPageList(route, list, allPages)
edit.setBlockConfig(list.value)

watch(
  () => list.value,
  (val) => {
    edit.setBlockConfig(val)
  },
  { deep: true },
)
watch(
  () => edit.blockConfig,
  (val) => {
    list.value = val
  },
  { deep: true },
)
const pageClass = computed(() => {
  return { 'is-mobile': edit.isMobileViewport }
})
const onDrop = (event: DragEvent) => {
  event.preventDefault()
  const data = event.dataTransfer?.getData('application/json')
  if (!data) return
  try {
    const block = JSON.parse(data) as BaseBlock
    if (event.target instanceof HTMLElement) {
      const rect = event.target?.getBoundingClientRect()
      if (rect) {
        block.x = event.clientX - rect.left
        block.y = event.clientY - rect.top
      }
    }
  } catch (error) {
    console.error('拖拽数据解析失败', error)
  }
}
</script>

<style scoped lang="scss">
.edit-render {
  container-type: inline-size;
  position: relative;
  width: 100%;
  min-height: calc(100vh - var(--edit-header-height));
  margin-left: var(--edit-block-width);
  margin-top: var(--edit-header-height);
  background: white;

  &.is-mobile {
    width: 375px;
    overflow: hidden;
    margin-left: auto;
    margin-right: auto;
    margin-top: calc(var(--edit-header-height) + 20px);
    margin-bottom: 20px;
    transform: translateX(10px);
  }

  .empty {
    position: absolute;
    z-index: 0;
    top: 0;
    width: inherit;
  }

  .render {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
}
</style>
