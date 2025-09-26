<template>
    <div :class="classes" :style="styles">
        <div class="item" v-for="(item, index) in cols" :key="index" :style="itemStyle(item)">
            <slot :item="itemComputed(index)" :index="index"></slot>
        </div>
    </div>

</template>

<script setup lang="ts">
import { createNameSpace } from '@/utils/components';
import { computed, toRefs } from 'vue';
import { props } from './props'

const { n } = createNameSpace('column')
defineOptions({
    name: 'mo-column'
})
const propsData = defineProps(props)
const { data, viewport, children } = toRefs(propsData)
const classes = computed(() => [n()])
const cols = computed(() => data.value?.cols?.[viewport.value] || [0.5, 0.5])
const background = computed(() => data.value?.background?.[viewport.value] || '')
const styles = computed(() => ({ background: background.value }))
const itemStyle = computed(() => (item: number | string) => ({ width: Number(item) * 100 + '%' }))
const itemComputed = computed(() => (index: number) => children.value?.[index] || [])
</script>

<style scoped lang="scss">
@import './index.scss'
</style>