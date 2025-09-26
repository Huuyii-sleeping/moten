<template>
    <div class="edit">
        <edit-header></edit-header>
        <div class="container">
            <edit-block></edit-block>
            <edit-render></edit-render>
            <edit-config></edit-config>
        </div>
    </div>
</template>

<script setup lang="ts">
import editHeader from '@/components/edit/edit-header.vue';
import editBlock from '@/components/edit/edit-block.vue';
import editConfig from '@/components/edit/edit-config.vue';
import editRender from '@/components/edit/edit-render.vue';
</script>

<style scoped lang="scss">
.edit {
    .container {
        display: flex;    
    }
}
</style>