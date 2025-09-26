<template>
    <component :is="tag" :class="classes" v-bind="$attrs" :href="to" :to="to" :target="target">
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import { createNameSpace } from '@/utils/components';
import { computed, toRefs } from 'vue';
import { props } from './props'

const { n } = createNameSpace('link')
defineOptions({ name: 'mo-link' })
const propsData = defineProps(props)
const { to, target } = toRefs(propsData)
const classes = computed(() => { [n()] })
const tag = computed(() => {
    if (to.value) return 'span'
    return isExternalLink.value ? 'a' : 'router-link'
})

const isExternalLink = computed(() => {
    return to.value.match(/^(http:\/\/|https:\/\/|javascript:.*|tel:.*|mailto:.*)/)
})
</script>

<style scoped lang="scss">
@import './index.scss'
</style>