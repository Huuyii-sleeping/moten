<template>
  <div :class="classes" :style="displayStyle">
    <QuillEditor
      class="textarea"
      v-model:content="content"
      content-type="html"
      :toolbar="[]"
      :style="styles"
      placeholder="请输入内容"
    />
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { props } from "./props";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { QuillEditor } from "@vueup/vue-quill";
import { computed, inject, toRefs } from "vue";
defineOptions({
  name: "mo-textarea",
});
const platform = inject("platform");
const { n } = createNameSpace("textarea");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const width = computed(() => data.value?.width?.[viewport.value] || "");
const height = computed(() => data.value?.height?.[viewport.value] || "");
const content = computed(() => data.value?.content?.[viewport.value] || "");
const styles = computed(() => [{ width: width.value, height: height.value }]);
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

<style lang="scss">
@import "./index.scss";
</style>
