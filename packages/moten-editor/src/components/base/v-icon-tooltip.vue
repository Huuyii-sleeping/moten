<template>
    <div class="icon">
        <el-tooltip class="tip" effect="dark" :content="content" :placement="placement" :hide-after="0">
            <div class="image-box">
                <Icon v-if="icon" class="image" :icon="icon" />
                <slot v-else class="image" />
            </div>
        </el-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
defineProps({
    icon: {
        type: String,
        default: '',
    },
    content: {
        type: String,
        require: true,
        default: '',
    },
    placement: {
        type: String,
        default: 'bottom',
    },
})
</script>

<style lang="scss" scoped>
.icon {
    user-select: none;
}

.image-box {
    cursor: pointer;
    width: 26px;
    height: 26px;
    padding: 3px;
    border-radius: var(--border-radius);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    transition: all 0.2s linear;

    &:hover {
        background: var(--color-icon-hover);
        transition: all 0.2s linear;
    }

    .image {
        width: 90%;
        height: 90%;
    }
}
</style>