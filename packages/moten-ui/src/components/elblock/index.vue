<template>
  <div :class="classes">
    <span class="demonstration">{{ title }}</span>
    <el-date-picker
      v-model="block"
      type="datetime"
      :placeholder="placeholder"
      :size="size"
    />
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, ref, toRefs } from "vue";
import { props } from "./props";

const { n } = createNameSpace("elblock");
defineOptions({
  name: "mo-elblock",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const block = ref("");
const classes = computed(() => [n()]);
const placeholder = computed(
  () => data.value?.placeholder?.[viewport.value] || ""
);
const size = computed(() => data.value?.size?.[viewport.value] || "");
const title = computed(() => data.value?.title?.[viewport.value] || "");
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
