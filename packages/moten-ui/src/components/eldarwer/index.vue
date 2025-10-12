<template>
  <div :class="classes" :style="styles">
    <el-drawer
      v-model="currentVisible"
      :title="title"
      :direction="direction"
      :with-mask="withMask"
      :style="drawerStyle"
      @close="handleClose"
    >
      <div class="drawer-content">{{ content }}</div>
      <template #footer>
        <div class="drawer-footer">
          <el-button type="primary" @click="currentVisible = false">
            关闭抽屉
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, ref, watch } from "vue";
import { props } from "./props";
const { n } = createNameSpace("eldrawer");
defineOptions({
  name: "mo-eldrawer",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const title = computed(() => data.value?.title?.[viewport.value] || "抽屉面板");
const content = computed(() => data.value?.content?.[viewport.value] || "");
const width = computed(() => data.value?.width?.[viewport.value] || "100%");
const height = computed(() => data.value?.height?.[viewport.value] || "295px");
const direction = computed(
  () => data.value?.direction?.[viewport.value] || ("ltr" as any)
);
const size = computed(() => data.value?.size?.[viewport.value] || "30%");
const withMask = computed(() => data.value?.withMask?.[viewport.value] ?? true);
const initVisible = computed(
  () => data.value?.visible?.[viewport.value] ?? false
);
const currentVisible = ref(initVisible.value);
const drawerStyle = computed(() => {
  const isHorizontal = ["left", "right"].includes(direction.value);
  return isHorizontal ? { width: size.value } : { height: size.value };
});
watch(
  initVisible,
  (newVal) => {
    currentVisible.value = newVal;
  },
  { immediate: true }
);
const handleClose = () => {
  // 若需同步更新 props 中的 visible，可添加 emit 逻辑
  // emit('update:visible', false);
};
const classes = computed(() => [n()]);
const styles = computed(() => {
  return {
    height: height.value,
    width: width.value
  };
});
</script>

<style scoped lang="scss">
// 抽屉内容样式
.drawer-content {
  padding: 0 20px;
  color: #64748b;
  line-height: 1.8;
  font-size: 14px;
  height: 100%;
}

// 抽屉底部按钮区样式
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

// 适配移动端：底部弹出时调整内边距
:deep(.el-drawer--bottom) {
  .el-drawer__body {
    padding-bottom: 80px; // 给底部按钮区预留空间
  }
}
</style>
