<template>
    <div class="edit-config-block">
        <!-- 渲染动态组件 -->
        <edit-config-render :list="list" @callback="callback">
            <div v-if="!edit.currentSelect">
                <el-empty description="请从左侧拖入组件之后，点击选中组件">
                    <template #image>
                        <v-icon icon="dragBlank" class="icon"></v-icon>
                    </template>
                </el-empty>
            </div>
        </edit-config-render>
    </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit';
import { ref, watch } from 'vue';
import { blockSchema, type BlockSchemaKeys } from '@/config/schema';
import { findNodeById } from './nested';
import deepmerge from 'deepmerge'
import type { BaseBlock } from '@/types/edit';
const edit = useEditStore()
const list = ref<any[]>([])
const callback = (params: { data: Object; id: string }) => {
    const { data, id } = params
    if (!id) return
    const blockConfig = edit.blockConfig || []
    const newBlockConfig = findNodeById(blockConfig, id, (params: any) => {
        let { array, index, node } = params
        const overwriteMerge = (_destinationArray: any, sourceArray: any, options: any) => sourceArray
        array[index].formData = deepmerge(node.formData, data, { arrayMerge: overwriteMerge })
    })
    edit.setBlockConfig(newBlockConfig as BaseBlock[])
}
watch(() => edit.currentSelect, (value) => {
    const code = value?.code as BlockSchemaKeys
    const properties = blockSchema[code].properties
    if (!value || !properties) {
        list.value = []
        return
    }
    const { formData, id } = value as any
    const listResult = Object.fromEntries(
        Object.entries(properties).map((itemChild) => {
            const [key, value] = itemChild as any
            return [key, { ...value, id, key, formData: formData?.[key] || {} }]
        })
    )
    list.value = [...Object.values(listResult)]
}, { immediate: true, deep: true })
</script>

<style scoped lang="scss">
.edit-config-block {
    width: 100%;
}
</style>
