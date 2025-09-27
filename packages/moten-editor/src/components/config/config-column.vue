<template>
    <div class="config-column">
        <el-form-item>
            <div class="list">
                <div v-for="(item, index) in column" :key="index" class="item">
                    <div v-html="widthFormat(item)" class="input" />
                </div>
            </div>
            <div class="action-box">
                <div class="item">
                    <v-icon v-if="isShowRemove" icon="subtract" class="icon" @click="remove" />
                    <v-icon v-if="isShowAdd" icon="add" class="icon" @click="add" />
                </div>
            </div>
        </el-form-item>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'

const props = defineProps({
    data: {
        type: Object,
        default: () => { },
    },
    viewport: {
        type: String,
        default: 'desktop',
    },
})

const emit = defineEmits(['callback'])

const { data } = toRefs(props)
const { formData, key, id } = data.value
const { default: defaultValue, minItems, maxItems } = data.value.properties[props.viewport]
const realDefaultValue = Array.from({ length: minItems }, (_) => defaultValue)

const column = ref<number[]>([])
const isShowAdd = computed(() => column.value.length < maxItems)
const isShowRemove = computed(() => column.value.length > minItems)

watch(
    formData,
    (value) => {
        column.value = value?.[props.viewport] || realDefaultValue
    },
    {
        immediate: true,
    },
)

watch(
    column,
    (value) => {
        if (value.length > maxItems) return

        const _value = value
        const data = { desktop: _value, mobile: _value }

        emit('callback', {
            data: {
                [key]: data,
            },
            id,
        })
    },
    {
        immediate: true,
    },
)
// 创建指定长度的数组 并进行赋值操作
const updateNumber = (length: number) => Array.from({ length: length }, (_) => 1 / length)

const widthFormat = (width: number) => parseInt(String(width * 10000)) / 100 + '%'

const add = () => {
    const { length } = column.value
    if (length === maxItems) return
    column.value = updateNumber(length + 1)
    console.log(column.value)
}
const remove = () => {
    const { length } = column.value
    if (length === 1) return
    column.value = updateNumber(length - 1)
}
</script>

<style lang="scss" scoped>
.config-column {
    .list {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    .action-box {
        width: 100%;
        display: flex;
    }

    .item {
        flex: 1;
        flex-shrink: 0;
        background: var(--color-config-block-bg);
        border: 1px dashed var(--color-border);
        border-right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
        font-size: 13px;

        &:first-child {
            border-top-left-radius: var(--border-radius);
            border-bottom-left-radius: var(--border-radius);
        }

        &:last-child {
            border: 1px dashed var(--color-border);
            border-top-right-radius: var(--border-radius);
            border-bottom-right-radius: var(--border-radius);
        }

        .input {
            width: 100%;
            height: 38px;
            padding: 8px;
            text-align: center;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }

        .icon {
            width: 20px;
            height: 20px;
            margin: 0 10px;
            display: flex;
            justify-content: center;
            align-items: center;

            &:hover {
                background-color: #5a9cf8;
                border-radius: 4px;
                color: white;
            }
        }
    }
}
</style>