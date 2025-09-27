<template>
    <div class="config-input">
        <el-form-item :label="title">
            <el-input v-model="input" :placeholder="placeholder" class="input"></el-input>
        </el-form-item>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
const props = defineProps({
    data: {
        type: Object,
        default: () => { },
    },
    viewport: {
        type: String,
        default: 'desktop'
    }
})
const emit = defineEmits(['callback'])
const { data } = toRefs(props)
const { formData, parentKey, key, id } = data.value
console.log("data.value", data.value)
const { title, default: defaultValue, placeholder } = data.value.properties[props.viewport]
const input = ref('')

watch(() => formData, (value) => {
    input.value = value?.[props.viewport] || defaultValue
}, { immediate: true })

watch(input, (value) => {
    let data = {}
    const _value = value || ''
    // 进行赋值操作 当我们没有formData 我们需要同时对两端进行设置参数，保证数据的统一
    if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
    else data = { [props.viewport]: _value }

    // 用来找到特定的对应的组件，精准匹配
    emit('callback', {
        data: {
            [key]: data,
        },
        id,
    })
}, { immediate: true })
</script>

<style scoped lang="scss">
.config-input {
    :deep(.el-input__wrapper) {
        background: var(--color-config-block-bg);
    }
}
</style>