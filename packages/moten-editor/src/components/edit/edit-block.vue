<template>
    <div class="edit-block">
        <div class="left">
            <div class="menu-item" v-for="(item, index) in menuList" :key="index"
                :class="{ 'is-active': index === activeMenu }" @click="activeMenu = index">
                <v-icon class="menu-icon" :icon="index === activeMenu ? item.iconActive : item.icon">
                </v-icon>
                <div class="menu-name">{{ item.name }}</div>
            </div>
        </div>
        <div class="right" v-if="activeMenu === 0">
            <el-collapse v-model="activeNames">
                <el-collapse-item title="基础组件" name="1">
                    <edit-block-drag :list="baseBlockList"
                        :group="{ name: dragGroup, pull: 'clone', put: false }"></edit-block-drag>
                </el-collapse-item>
                <el-collapse-item title="高级组件" name="2">
                    <edit-block-drag :list="seniorBlockList" :sort="false"
                        :group="{ name: dragGroup, pull: 'clone', put: false }"></edit-block-drag>
                </el-collapse-item>
            </el-collapse>
        </div>
        <div class="right" v-else-if="activeMenu === 1"></div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { dragGroup } from './nested'
import { baseBlock as baseBlocks, seniorBlocks } from '@/config/block'
import { dragGroup } from './nested'

const menuList = ref([
    {
        icon: 'block',
        iconActive: 'blockActive',
        name: '组件',
    },
    {
        icon: 'kit',
        iconActive: 'kitActive',
        name: '套件',
    },
])
const activeMenu = ref(0)
const activeNames = ref(['1', '2'])

const baseBlockList = ref(baseBlocks)
const seniorBlockList = ref(seniorBlocks)
</script>

<style scoped lang="scss">
.edit-block {
    position: fixed;
    top: var(--edit-header-height);
    left: 0;
    flex-shrink: 0;
    background: white;
    border-right: 1px solid var(--color-border);
    display: flex;
    justify-content: flex-start;
    width: var(--edit-block-width);

    .left {
        width: 70px;
        height: calc(100vh - var(--edit-header-height));
        border-right: 1px solid var(--color-border);

        .menu-item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            padding: 5.5px 0;
            border-radius: var(--border-radius);
            cursor: pointer;
            margin: 17px 5px;

            &.is-active,
            &:hover {
                background: var(--color-block-hover);
                border-radius: var(--border-radius);
            }

            .menu-icon {
                width: 30px;
                height: 30px;
                margin: 0 auto;
            }

            .menu-name {
                font-size: 14px;
                line-height: 14px;
                padding-top: 4px;
            }
        }
    }

    .right {
        flex: 1;
        height: calc(100vh - var(--edit-header-height));
        overflow: auto;
    }

    :deep(.el-collapse) {
        border: 0;
    }

    :deep(.el-collapse-item__header) {
        padding-left: 14px;
        font-size: 14px;
    }

    :deep(.el-collapse-item__content) {
        padding-left: 14px;
        padding-right: 14px;
        padding-bottom: 14px;
    }
}
</style>