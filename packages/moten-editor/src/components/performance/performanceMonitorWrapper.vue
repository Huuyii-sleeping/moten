<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { PerformanceMonitor } from '@/modules/performance/PerformanceMonitor'
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
  componentId: {
    type: String,
    required: true,
  },
})
onMounted(() => {
  const monitor = PerformanceMonitor.getInstance()
  monitor.startMonitoringComponent(props.componentId)
})
onBeforeUnmount(() => {
  const monitor = PerformanceMonitor.getInstance()
  monitor.endMonitoringComponent(props.componentId)
})
</script>

<style scoped lang="scss"></style>
