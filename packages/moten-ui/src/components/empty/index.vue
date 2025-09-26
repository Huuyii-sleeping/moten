<template>
    <div :class="classes">
        <img :src="src" class="image">
        <div class="description" v-html="description"></div>
    </div>

</template>

<script setup lang="ts">
import { createNameSpace } from '@/utils/components';
import { computed, toRefs } from 'vue';
import noDataIcon from '@/assets/images/no-data.png'
import { props } from './props'

const { n } = createNameSpace('empty')
defineOptions({ name: 'mo-empty' })
const propsData = defineProps(props)
const { image, description } = toRefs(propsData)
const classes = computed(() => [n()])
const src = computed(() => image.value || noDataIcon)
</script>

<style scoped lang="scss">
@import './index.scss'
</style>
