<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <el-progress
      :percentage="percentage"
      :status="status"
      :type="type"
    ></el-progress>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject } from "vue";
import { props } from "./props";

const { n } = createNameSpace("elprogress");
defineOptions({
  name: "mo-elprogress",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const percentage = computed(
  () => data.value?.percentage?.[viewport.value] || "50"
);
const width = computed(() => data.value?.width?.[viewport.value] || "100%");
const type = computed(() => data.value?.type?.[viewport.value] || "line");
const status = computed(() => data.value?.status?.[viewport.value] || "");
const height = computed(() => data.value?.height?.[viewport.value] || "295px");
const styles = computed(() => ({ width: width.value, height: height.value }));
const display = computed(() => {
  const display = data.value?.display?.[viewport.value];
  return typeof display === "boolean" ? display : true;
});
// 多端展示的配置
const displayStyle = computed(() => {
  if (platform === "editor") {
    return !display.value ? { opacity: 0.4, filter: "brightness(0.7)" } : {};
  } else {
    return !display.value ? { display: "none" } : {};
  }
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
