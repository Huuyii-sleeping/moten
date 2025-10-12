<template>
  <div :class="classes" :style="displayStyle">
    <el-collapse v-model="activeNames" :style="styles">
      <el-collapse-item :title="title" :name="1">
        <div class="collapse-content">{{ content }}</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject, ref } from "vue";
import { props } from "./props";

const { n } = createNameSpace("elcollapse");
defineOptions({
  name: "mo-elcollapse",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);

const classes = computed(() => [n()]);
const title = computed(() => data.value?.title?.[viewport.value] || "折叠面板");
const content = computed(
  () => data.value?.content?.[viewport.value] || "内容描述"
);
const width = computed(() => data.value?.width?.[viewport.value] || "");
const defaultExpanded = computed(
  () => data.value?.defaultExpanded?.[viewport.value] || false
);
const styles = computed(() => ({ width: width.value }));

// 控制折叠面板的激活状态
const activeNames = ref(defaultExpanded.value ? [1] : []);

const display = computed(() => {
  const display = data.value?.display?.[viewport.value];
  return typeof display === "boolean" ? display : true;
});

// 多端显示控制样式
const displayStyle = computed(() => {
  if (platform === "editor") {
    return !display.value ? { opacity: 0.4, filter: "brightness(0.7)" } : {};
  } else {
    return !display.value ? { display: "none" } : {};
  }
});
</script>

<style scoped lang="scss">
.collapse-content {
  padding: 16px;
  color: #64748b;
  line-height: 1.6;
}
</style>
