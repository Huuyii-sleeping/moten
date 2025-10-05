<template>
    <div class="config-color">
        <el-form-item :label="title">
            <el-color-picker v-model="color" show-alpha />
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
        default: 'desktop',
    }
})

const emits = defineEmits(['callback'])
const { data } = toRefs(props)
const { formData, key, id } = data.value
const { title, default: defaultValue, placeholder } = data.value.properties[props.viewport]
console.log(title)
console.log('defaultValue:', defaultValue)
const color = ref('')

watch(formData, (value) => {
    color.value = value?.[props.viewport] || defaultValue
})

watch(color, (value) => {
    let data = {}
    const _value = value || ''
    if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
    else data = { [props.viewport]: _value }

    emits('callback', {
        data: {
            [key]: data
        },
        id
    })
}, { immediate: true })
</script>

<style scoped lang="scss"></style>