<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <mo-link v-if="src" :to="link" target="_blank">
      <img class="image" v-bind="$attrs" :src="src" alt="" :style="styles" />
    </mo-link>
    <div v-else class="no-image" :style="styles">
      <mo-empty description="暂无图片，请上传"></mo-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject } from "vue";
import { props } from "./props";
import MoLink from "@/components/link";
import MoEmpty from "@/components/empty";

const { n } = createNameSpace("image");
defineOptions({
  name: "mo-image",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const src = computed(() => data.value?.src?.[viewport.value] || "");
const width = computed(() => data.value?.width?.[viewport.value] || "300px");
const link = computed(() => data.value?.link?.[viewport.value] || "");
const height = computed(() => data.value?.height?.[viewport.value] || "200px");
const styles = computed(() => ({
  width: width.value,
  height: height.value,
  backgroundColor: "#ffffff",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
}));
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
