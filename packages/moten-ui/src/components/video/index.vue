<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <video
      v-if="videoUrl"
      class="video"
      :style="styles"
      controls
      :src="videoUrl"
      :poster="posterUrl"
      :width="width"
      :height="height"
    ></video>
    <div v-else :class="classes" class="no-video">
      <mo-empty description="暂无视频,请上传" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject } from "vue";
import { props } from "./props";
import MoEmpty from "@/components/empty";

const { n } = createNameSpace("video");
defineOptions({
  name: "mo-video",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const posterUrl = computed(() => data.value?.posterUrl?.[viewport.value] || "");
const width = computed(() => data.value?.width?.[viewport.value] || "300px");
const videoUrl = computed(() => data.value?.videoUrl?.[viewport.value] || "");
const height = computed(() => data.value?.height?.[viewport.value] || "200px");
const styles = computed(() => [
  {
    width: width.value,
    height: height.value,
    backgroundColor: "#ffffff",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
  },
]);
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
