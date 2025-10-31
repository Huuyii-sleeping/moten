<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <div class="canvas" v-for="(item, index) in children" :key="index">
      <slot :item="item" :index="index"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, toRefs } from "vue";
import { props } from "./props";
import { createNameSpace } from "@/utils/components";
const { n } = createNameSpace("canvas");
defineOptions({
  name: "mo-canvas",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport, children } = toRefs(propsData);
const classes = computed(() => [n()]);
const width = computed(() => data.value?.width?.[viewport.value] || "200px");
const height = computed(() => data.value?.height?.[viewport.value] || "295px");
const color = computed(() => data.value?.color?.[viewport.value] || "");
const styles = computed(() => ({
  width: width.value,
  height: height.value,
  backgroundColor: color.value,
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
