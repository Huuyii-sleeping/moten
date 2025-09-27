<template>
    <div class="edit-config-render">
        <el-form label-width="auto">
            <div v-for="(item, index) in list" :key="index">
                <component v-if="getComponent(item)" :is="getComponent(item)" :data="item" :viewport="edit.viewport"
                    @callback="callback"></component>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { batchDynamicComponents } from '@/utils';
import { useEditStore } from '@/stores/edit';
const edit = useEditStore()

defineProps({
    list: {
        type: Array,
        default: () => []
    }
})
const emit = defineEmits(['callback'])
const callback = (data: any) => {
    emit('callback', data)
}
const getComponent = (item: any) => {
    const viewport = edit.viewport
    const code = item.properties[viewport].code
    return batchDynamicComponents(code, import.meta.glob('@/components/config/**/*.vue'))
}
</script>

<style scoped lang="scss">
.edit-config-render {
    overflow-y: auto;
    width: 100%;

    :deep(.el-form) {
        padding-left: 14px;
        padding-right: 14px;
        padding-bottom: 14px;
    }

    :deep(.el-form-item__label) {
        justify-content: flex-start;
    }
}
</style>