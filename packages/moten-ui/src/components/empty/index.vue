<template>
    <div :class="classes">
        <!-- attrs拿到所有的属性 -->
        <img v-bind="$attrs" :src="src" alt="" :styles="styles">
    </div>

</template>

<script setup lang="ts">
import { createNameSpace } from '@/utils/components';
import { computed, toRefs } from 'vue';
import { props } from './props'

const { name, n } = createNameSpace('image')
defineOptions({ name })
const propsData = defineProps(props)
const { data, viewport } = toRefs(propsData)
const classes = computed(() => { [n()] })
const display = computed(() => data.value?.display?.[viewport.value] || '')
const src = computed(() => data.value?.src?.[viewport.value] || '')
const width = computed(() => data.value?.width?.[viewport.value] || '')
const height = computed(() => data.value?.height?.[viewport.value] || '')
const styles = computed(() => [{ width: width.value, height: height.value }])
</script>

<style scoped lang="scss">
@import './index.scss'
</style>