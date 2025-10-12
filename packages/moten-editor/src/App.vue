<script setup lang="ts">
import { onErrorCaptured } from 'vue'

onErrorCaptured((error: any, instance: any, info: any) => {
  fetch('/api/monitor/vue-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'vue-component-error',
      error: error.message,
      component: instance?.type?.name || 'Anonymous',
      info,
      stack: error.stack || '',
      timestamp: Date.now(),
    }),
  }).catch(console.error)

  return false
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
