<template>
  <div class="edit" :class="pageClass">
    <edit-header></edit-header>
    <div class="container" :class="pageClass">
      <edit-render-drag :list="newList"></edit-render-drag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPageList } from '@/components/edit/nested'
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
    return ref(props.list)
  }
  const _temp = ref<any[]>([])
  getPageList(route, _temp, allPages)
  return _temp
}
const newList = getResolveList()
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
</style>
