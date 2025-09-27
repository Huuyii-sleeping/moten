<template>
    <div class="edit-config-page">
        <edit-config-render :list="list" @callback="callback"></edit-config-render>
    </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit';
import { ref } from 'vue';
import { pageSchema, type PageSchemaFormData } from '@/config/schema';
import deepmerge from 'deepmerge';

const edit = useEditStore()

const properties = pageSchema.properties

const list = ref<(typeof properties)[keyof typeof properties][]>([])

const listResult = Object.fromEntries(
    Object.entries(properties).map((itemChild) => {
        const [key, value] = itemChild
        return [key, { ...value, key, formData: edit.pageConfig || {} }]
    })
)

list.value = [...Object.values(listResult)]

const callback = (params: { data: Object }) => {
    const { data } = params
    const key = Object.keys(data)[0]
    const formData = edit.pageConfig || {}
    edit.setPageConfig(deepmerge.all([formData as any, data]))

    // 更新formdata的数据，防止切换展示导致数据的丢失 对原本数据进行操作
    list.value.forEach((item) => {
        if (item.key === key) {
            const itemFormData = deepmerge.all([item?.formData || {}, (data as any)[key]])
            item.formData = itemFormData
            return
        }
    })
}
</script>

<style scoped lang="scss">
.edit-config-page {
    width: 100%;
}
</style>
