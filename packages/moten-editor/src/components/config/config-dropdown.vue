<template>
    <div class="config-dropdown">
        <el-form-item :label="title">
            <el-dropdown @command="handleCommand">
                <el-button>
                    {{ selectValue }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="(size, index) in select" :key="index" :command="size">{{ size
                            }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </el-form-item>

    </div>
</template>

<script setup lang="ts">
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
const emits = defineEmits(['callback'])
const { data } = toRefs(props)
const { formData, key, id } = data.value
const { title, default: defaultValue, placeholder, select } = data.value.properties[props.viewport]
const selectValue = ref(defaultValue)
const handleCommand = (command: String) => {
    selectValue.value = command
}

watch(() => formData, (value) => {
    select.value = value?.[props.viewport] || defaultValue
}, { immediate: true })

watch(selectValue, (value) => {
    let data = {}
    const _value = value || ''
    if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
    else data = { [props.viewport]: _value }

    emits('callback', {
        data: {
            [key]: data,
        },
        id
    })
})


</script>

<style scoped lang="scss"></style>