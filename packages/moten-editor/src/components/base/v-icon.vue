<template>
    <Icon :icon="srcIcon"></Icon>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import iconAll, { type ConfigIcon } from '@/config/icon'
import { computed } from 'vue'
const props = defineProps({
    icon: {
        type: String,
        default: '',
    }
})
const srcIcon = computed(() => {
    return iconAll[props.icon as ConfigIcon]
})
</script>

<style scoped lang="scss"></style>