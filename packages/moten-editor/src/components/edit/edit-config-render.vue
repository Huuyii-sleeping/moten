<template>
    <div class="edit-config-render">
        <el-form label-width="auto" ref="ruleFormRef" :model="form" :rules="rules">
            <div v-for="(item, index) in list" :key="index">
                <component v-if="getComponent(item)" :is="getComponent(item)" :data="item" :viewport="edit.viewport"
                    @callback="callback" @update="update"></component>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { batchDynamicComponents } from '@/utils';
import { useEditStore } from '@/stores/edit';
import { ref, watch } from 'vue';
const edit = useEditStore()

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    },
    schema: {
        type: Object,
        default: () => { }
    }
})

const ruleFormRef = ref()
// form是根据JSON schema动态获取的
const form = ref<any>({})

// 根据传递的key的提取字段的值 schema对象具有properties
const transfer = (b: any, key = 'default'): void => {
    if(!b) return
    return Object.fromEntries(
        Object.entries(b.properties).map((item: any) => {
            const [keyP, valueP] = item
            if (valueP.properties) return [keyP, transfer(valueP, key)]
            return [keyP, valueP[key]]
        })
    )
}

const rules = ref(transfer(props.schema, 'rules'))

// 对form数据进行替换
const update = (params: any) => {
    const list = Object.entries(params || {})
    list.forEach(([key, value]) => {
        form.value[key] = value
    })
}

const submitForm = () => {
    setTimeout(() => {
        if (!ruleFormRef.value) return
        ruleFormRef.value.validate((valid: any, fields: any) => {

        })
    }, 100)
}

submitForm()
// 对渲染组件进行监听 重新校验
watch(() => props.list, () => {
    submitForm()
})

const emit = defineEmits(['callback'])
const callback = (data: any) => {
    console.log(data)
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