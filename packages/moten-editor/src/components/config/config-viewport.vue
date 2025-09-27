<template>
    <div class="config-viewport">
        <el-form-item :label="title">
            <config-base-tab :data="list" @change="change">
                <template #default="{ item }">
                    <v-icon-tooltip :icon="item.icon" :content="item.content" class="icon"></v-icon-tooltip>
                </template>
            </config-base-tab>
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
const emit = defineEmits(['callback'])
const { data } = toRefs(props)
const { formData, key, id } = data.value
const { title, default: defaultValue } = data.value.properties[props.viewport]

interface ViewportList {
    icon: string
    content: string
    value: 'all' | 'mobile' | 'desktop'
    default: boolean
}

const list = ref<ViewportList[]>([
    {
        icon: 'allViewport',
        content: '多端显示',
        value: 'all',
        default: false
    },
    {
        icon: 'desktop',
        content: '仅桌面端展示',
        value: 'desktop',
        default: false,
    },
    {
        icon: 'mobile',
        content: '仅移动端展示',
        value: 'mobile',
        default: false,
    }
])

const callback = (value: { desktop: boolean, mobile: boolean }) => {
    emit('callback', {
        data: {
            [key]: value,
        },
        id
    })
}
const change = (value: ViewportList['value']) => {
    const rules = {
        all: { desktop: true, mobile: true },
        desktop: { desktop: true, mobile: false },
        mobile: { desktop: false, mobile: true },
    }
    callback(rules[value])
}
watch(() => formData, (value) => {
    const _formData = value?.[key]
    const defaultValueIndex = Math.max(list.value.findIndex((v) => v.value === _formData || defaultValue), 0)
    list.value[defaultValueIndex].default = true
    change(list.value[defaultValueIndex].value)
}, { immediate: true })
</script>

<style scoped lang="scss">
.config-viewport {
    :deep(.el-form-item) {
        align-items: center;
    }

    .icon {
        :deep(.image-box) {
            width: 30px;
            height: 30px;
        }
    }
}
</style>