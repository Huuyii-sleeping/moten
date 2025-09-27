<template>
    <div class="edit">
        <edit-header></edit-header>
        <div class="container" :class="classes">
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
import { useEditStore } from '@/stores/edit';
import { computed } from 'vue';
const edit = useEditStore()
const classes = computed(() => {
    return { 'mobile-background': edit.isMobileViewport }
})
</script>

<style scoped lang="scss">
.edit {
    width: 100%;
    overflow-x: hidden;
    user-select: none;
    --edit-header-height: 64px;
    --edit-block-width: 300px;

    .container {
        display: flex;
        width: 100%;
        min-width: 100%;

        &.mobile-background {
            background: var(--color-bg);
        }
    }
}
</style>