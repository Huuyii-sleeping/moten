<template>
    <div class="edit-render" :class="pageClass">
        <edit-render-drag :list="list" :group="dragGroup" class="render"></edit-render-drag>
        <el-empty class="empty" v-if="!list?.length" description="请将左侧的组件拖入到此处">
            <template #image>
                <v-icon icon="dragBlank" class="icon"></v-icon>
            </template>
        </el-empty>
    </div>
</template>

<script setup lang="ts">
import type { BaseBlock } from '@/types/edit';
import { computed, ref, watch } from 'vue';
import { dragGroup, reverseBlockConfig } from './nested';
import { useEditStore } from '@/stores/edit';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
const route = useRoute()
const edit = useEditStore()
const list = ref<BaseBlock[]>([])
const useUser = useUserStore()
const allPages = useUser.list
// 及时添加和更新

if (route.params) {
    const { id } = route.params
    if (id) {
        let selectPage: any
        allPages.forEach((page: any) => {
            console.log('---page:', page)
            if (page.page_id === Number(id)) {
                selectPage = page
                return
            }
        })

        if (selectPage) {
            const _page = reverseBlockConfig(selectPage.content)
            list.value = _page
        }
    }
}

watch(() => list.value, (val) => {
    edit.setBlockConfig(val)
}, { deep: true })
watch(() => edit.blockConfig, (val) => {
    list.value = val
}, { deep: true })
// const pageStyle = computed(() => { })
const pageClass = computed(() => {
    return { 'is-mobile': edit.isMobileViewport }
})

</script>

<style scoped lang="scss">
.edit-render {
    container-type: inline-size;
    position: relative;
    width: 100%;
    min-height: calc(100vh - var(--edit-header-height));
    margin-left: var(--edit-block-width);
    margin-top: var(--edit-header-height);
    background: white;

    &.is-mobile {
        width: 375px;
        overflow: hidden;
        margin-left: auto;
        margin-right: auto;
        margin-top: calc(var(--edit-header-height) + 20px);
        margin-bottom: 20px;
        transform: translateX(10px);
    }

    .empty {
        position: absolute;
        z-index: 0;
        top: 0;
        top: 0;
        width: inherit;
    }

    .render {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
    }
}
</style>