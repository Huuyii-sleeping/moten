<template>
    <div v-for="(item, index) in newList" :key="index">
        <component v-if="!isMultiColumn(item)" :is="renderComponentCode(item)" :key="index" :data="item.formData"
            :viewport="edit.viewport">
        </component>
        <component v-else :key="item.id" :is="renderComponentCode(item)" :data="item.formData"
            :viewport="edit.viewport">
            <div v-for="(column, colIndex) in item.children" :key="colIndex" class="column">
                <preview v-if="Array.isArray(column) && column.length" :list="column" />
            </div>
        </component>
    </div>
</template>

<script setup lang="ts">
import { getPageList } from '@/components/edit/nested';
import { COMPONENT_PREFIX } from '@/config';
import { useEditStore } from '@/stores/edit';
import { useUserStore } from '@/stores/user';
import { computed, ref } from 'vue';
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
console.log('list:', newList.value)
const renderComponentCode = computed(() => {
    return (element: { code: string, type: string }) => {
        if (element.type) {
            return element.code
        }
        console.log(element.code)
        return COMPONENT_PREFIX + '-' + element.code
    }
})
const isMultiColumn = (item: any) => {
    return item.code === 'column';
};
const edit = useEditStore()
</script>

<style scoped lang="scss"></style>