<template>
    <div :class="classes">

    </div>

</template>

<script setup lang="ts">
import { createNameSpace } from '@/utils/components';
import { computed, toRefs } from 'vue';
import { props } from './props'

const { n } = createNameSpace('column')
defineOptions({
    name: 'mo-image'
})
const propsData = defineProps(props)
const {  } = toRefs(propsData)
const classes = computed(() =>  [n()] )

</script>

<style scoped lang="scss">
@import './index.scss'
</style>