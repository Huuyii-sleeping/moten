<template>
  <div class="edit" :class="pageClass">
    <edit-header :isPreview="true"></edit-header>
    <div class="container" :class="pageClass">
      <div class="overlay"></div>
      <InteractPreviewRender :list="newList" class="export_render"></InteractPreviewRender>
    </div>
  </div>
</template>

<script setup lang="ts">
import InteractPreviewRender from '@/components/edit/InteractPreviewRender.vue'
import { getPageList } from '@/components/edit/utils/nested'
import { useEditStore } from '@/stores/edit'
import { useUserStore } from '@/stores/user'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'preview',
})
const props = defineProps<{
  list?: any[]
}>()
const useUser = useUserStore()
const route = useRoute()
const allPages = useUser.list
const getResolveList = () => {
  if (props.list) {
    return props.list
  }
  const _temp = ref<any[]>([])
  getPageList(route, _temp, allPages)
  return _temp
}
const newList = getResolveList() as any
console.log('newList:', newList)
const edit = useEditStore()
const pageClass = computed(() => {
  return { 'is-mobile': edit.isMobileViewport }
})
onMounted(() => {
  edit.setPreview(true)
})
onUnmounted(() => {
  edit.setPreview(false)
})
</script>

<style scoped lang="scss">
.container {
  container-type: inline-size;
  position: relative;
  width: 100%;
  min-height: calc(100vh - var(--edit-header-height));
  //   margin-left: var(--edit-block-width);
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
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0); /* 改为半透明，方便调试 */
  z-index: 9999; /* 必须高于所有拖拽元素 */
  cursor: not-allowed;
  pointer-events: auto; /* 确保拦截事件 */
}
</style>
