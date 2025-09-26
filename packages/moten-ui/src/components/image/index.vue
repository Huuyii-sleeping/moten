<template>
    <div>
        <img class="image" :src="src" alt="">
        <h1>标题</h1>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
defineOptions({
    name: 'mo-image'
})
defineProps<{ src: string }>()
const value = ref(1)
console.log(value.value)
</script>

<style scoped lang="scss">
.image{
    width: 300px;
    height: 200px;
    margin: 0 auto;
}

</style>