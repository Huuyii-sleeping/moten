<template>
    <edit-render-drag :list="newList"></edit-render-drag>
</template>

<script setup lang="ts">
import { getPageList } from '@/components/edit/nested';
import { useEditStore } from '@/stores/edit';
import { useUserStore } from '@/stores/user';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
    name: "preview"
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
onMounted(() => {
    edit.setPreview(true)
})
onUnmounted(() => {
    edit.setPreview(false)
})
</script>

<style scoped lang="scss"></style>