<template>
    <img :src="src" alt="">
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ src: string }>()
const value = ref(1)
console.log(value.value)
</script>

<style scoped>
img {
    width: 100px;
    margin: auto;
    background-color: red;
}
</style>