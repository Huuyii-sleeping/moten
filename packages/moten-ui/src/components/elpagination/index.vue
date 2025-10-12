<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <el-pagination
      :layout="seque"
      :disabled="disabled"
      :total="Number(total)"
    >
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject } from "vue";
import { props } from "./props";

const { n } = createNameSpace("elpagination");
defineOptions({
  name: "mo-elpagination",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const total = computed(() => data.value?.total?.[viewport.value] || 10);
const width = computed(() => data.value?.width?.[viewport.value] || "100%");
const disabled = computed(
  () => data.value?.disabled?.[viewport.value] || false
);
const seque = computed(
  () => data.value?.seque?.[viewport.value] || "prev, pager, next"
);
const height = computed(() => data.value?.height?.[viewport.value] || "295px");
const styles = computed(() => ({ width: width.value, height: height.value }));
const display = computed(() => {
  const display = data.value?.display?.[viewport.value];
  return typeof display === "boolean" ? display : true;
});
const displayStyle = computed(() => {
  if (platform === "editor") {
    return !display.value ? { opacity: 0.4, filter: "brightness(0.7)" } : {};
  } else {
    return !display.value ? { display: "none" } : {};
  }
});
</script>

<style scoped lang="scss"></style>
