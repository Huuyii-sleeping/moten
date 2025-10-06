<template>
  <div :class="classes">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in items"
        :key="index"
        :to="{ path: item.to }"
        >{{ item.content }}</el-breadcrumb-item
      >
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs } from "vue";
import { props } from "./props";
const { n } = createNameSpace("elbreadcrumb");
defineOptions({
  name: "mo-elbreadcrumb",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const items = computed(
  () =>
    data.value?.items?.[viewport.value] ||
    ([
      {
        content: "home",
        to: "/",
      },
      {
        content: "Config",
        to: "/edit",
      },
      {
        content: "Role",
        to: "/edit",
      },
    ] as Array<any>)
);
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
