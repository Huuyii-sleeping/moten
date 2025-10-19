<template>
  <div :class="classes" :style="styles">
    <div
      class="item"
      v-for="(item, index) in rows"
      :key="index"
      :style="itemStyle(item)"
    >
      <slot :item="itemComputed(index)" :index="index"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs } from "vue";
import { props } from "./props";

const { n } = createNameSpace("row");
defineOptions({
  name: "mo-row",
});
const propsData = defineProps(props);
const { data, viewport, children } = toRefs(propsData);
const classes = computed(() => [n()]);
const rows = computed(() => data.value?.rows?.[viewport.value] || [0.5, 0.5]);
const color = computed(() => data.value?.color?.[viewport.value] || "");
const styles = computed(() => ({
  background: color.value,
  width: "500px",
  height: "100%",
  justifyContent: "center",
}));
const itemStyle = computed(() => (item: number | string) => ({
  height: Number(item) * 100 + "%",
  minHeight: "296px",
}));
const itemComputed = computed(
  () => (index: number) => children.value?.[index] || []
);
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
