<template>
    <div :class="classes">
        <mo-link v-if="src" :to="link" target="_blank">
            <img class="image" v-bind="$attrs" :src="src" alt="" :styles="styles">
        </mo-link>
        <div v-else class="no-image">
            <mo-empty description="暂无图片，请上传"></mo-empty>
        </div>
    </div>

</template>

<script setup lang="ts">
import { createNameSpace } from '@/utils/components';
import { computed, toRefs } from 'vue';
import { props } from './props'
import MoLink from '@/components/link'
import MoEmpty from '@/components/empty'

const { n } = createNameSpace('image')
defineOptions({
    name: 'mo-image'
})
const propsData = defineProps(props)
const { data, viewport } = toRefs(propsData)
const classes = computed(() =>  [n()] )
console.log(viewport.value)
const src = computed(() => data.value?.src?.[viewport.value] || '')
const width = computed(() => data.value?.width?.[viewport.value] || '')
const link = computed(() => data.value?.link?.[viewport.value] || '')
const height = computed(() => data.value?.height?.[viewport.value] || '')
const styles = computed(() => [{ width: width.value, height: height.value }])
</script>

<style scoped lang="scss">
@import './index.scss'
</style>