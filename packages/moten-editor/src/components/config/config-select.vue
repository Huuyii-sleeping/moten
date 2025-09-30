<template>
    <div class="config-select">
        <el-form-item :label="title">
            <el-radio-group v-model="radio" @change="change">
                <el-radio value="1">Yes</el-radio>
                <el-radio value="2">No</el-radio>
            </el-radio-group>
        </el-form-item>

    </div>
</template>

<script setup lang="ts">
import type { ViewportType } from '@/config/constants';
import { ref, toRefs, watch } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => { }
    },
    viewport: {
        type: String,
        default: 'desktop'
    }
})
const emit = defineEmits(['callback'])
const { data } = toRefs(props)
const { formData, key, id } = data.value
const { title, default: defaultValue } = data.value.properties[props.viewport]
const radio = ref(defaultValue ? '1' : '2')

const otherViewport = props.viewport === 'desktop' ? 'mobile' : 'desktop'

const callback = (value: ViewportType) => {
    emit('callback', {
        data: {
            [key]: value,
        },
        id
    })
}

const change = (value: string) => {
    const _value = value === '1' ? true : false
    const _compareValue = {
        [props.viewport]: _value,
        [otherViewport]: defaultValue,
    }
    callback(_compareValue as ViewportType)
}

watch(() => formData, (value) => {
    const _formData = value?.[key]
    radio.value = _formData === true ? '1' : '2'
    change(radio.value)
}, { immediate: true })
</script>

<style scoped lang="scss"></style>