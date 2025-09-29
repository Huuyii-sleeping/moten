<template>
    <div>列表页</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { get, post } from '../composable/use-request'
onMounted(async () => {
    try {
        const response = await get('/rest/v1/page')
        console.log(response)
    } catch (error) {
        console.error(error)
    }
})

</script>

<style scoped lang="scss"></style>吧