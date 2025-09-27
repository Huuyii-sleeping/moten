<template>
    <div class="edit-config-block">
        <edit-config-render :list="list" @callback="callback">
            <div v-if="edit.currentSelect?.id">
                <el-empty description="请在左侧拖入组件后，点击选中组件">
                    <template #image>
                        <v-icon icon="dragBlank" class="icon" />
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
import type { BaseBlock } from '@/types/edit';
const edit = useEditStore()
const list = ref<any[]>([])
const callback = (params: { data: Object; id: string }) => {
    const { data, id } = params
    if (!id) return
    const blockConfig = edit.blockConfig || []
    const newBlockConfig = findNodeById(blockConfig, id, data)
    edit.setBlockConfig(newBlockConfig as BaseBlock[])
    // if (edit.currentSelect?.id === id) {
    //     const currentSelect = edit.currentSelect
    //     currentSelect.formData = deepmerge.all([edit.currentSelect.formData || {}, data])
    //     edit.setCurrentSelect(currentSelect)
    // }
}
watch(() => edit.currentSelect, () => {
    const code = edit.currentSelect?.code as BlockSchemaKeys
    const properties = blockSchema[code]?.properties
    if (!edit.currentSelect || !properties) {
        list.value = []
        return
    }
    const { formData, id } = edit.currentSelect as any
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
