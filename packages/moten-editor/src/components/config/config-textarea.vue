<template>
    <div class="config-textarea">
        <el-form-item :label="title">
            <el-mention v-model="input" type="textarea" style="width: 100%" placeholder="请输入内容" />
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
const input = ref('')

watch(formData, (value) => {
    input.value = value?.[props.viewport] || defaultValue
}, { immediate: true })

watch(input, (value) => {
    let data = {}
    const _value = value || ''
    if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
    else data = { [props.viewport]: _value }
    emit('callback', {
        data: {
            [key]: data
        },
        id
    })
}, { immediate: true })

const callback = (value: ViewportType) => {

}


</script>

<style scoped lang="scss"></style>