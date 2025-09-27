<template>
    <div class="config-files">
        <el-form-item :label="title">
            <img v-if="src" :src="src" class="image" @click="fileClick" />
            <div v-else class="file" @click="fileClick">
                <v-icon icon="upload" class="icon" />
            </div>
            <el-input v-model="src" style="display: none" />
        </el-form-item>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'

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
const { title, default: defaultValue } = data.value.properties[props.viewport]
const src = ref('')

watch(
    () => formData,
    (value) => {
        src.value = value?.[props.viewport] || defaultValue
    },
    {
        immediate: true,
    },
)

watch(
    src,
    (value) => {
        let data = {}
        const _value = value || ''
        if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
        else data = { [props.viewport]: _value }
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

const fileClick = () => {
    const list = [
        'https://gips2.baidu.com/it/u=600796006,4247107674&fm=3042&app=3042&f=JPEG&wm=1,huayi,0,0,13,9&wmo=0,0',
        'https://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960',
        'https://gips0.baidu.com/it/u=3554802836,624793446&fm=3042&app=3042&f=JPEG&wm=1,huayi,0,0,13,9&wmo=0,0',
        'https://gips2.baidu.com/it/u=3681636179,223758822&fm=3042&app=3042&f=JPEG&wm=1,huayi,0,0,13,9&wmo=0,0',
    ]
    const randomIndex = Math.floor(Math.random() * list.length)
    src.value = list[randomIndex]
}
</script>

<style lang="scss" scoped>
.config-files {

    .file,
    .image {
        width: 80px;
        height: 80px;
        box-shadow: 0 0 0 1px var(--color-border) inset;
        border-radius: var(--border-radius);
        background: var(--color-config-block-bg);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .is-error {

        .file,
        .image {
            box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }
    }

    .image {
        border: 0;
        width: 82px;
        height: 82px;
        object-fit: cover;
    }

    .icon {
        width: 26px;
        height: 26px;
    }
}
</style>