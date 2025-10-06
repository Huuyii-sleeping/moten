<template>
  <div :class="classes">
    <el-tabs v-model="selectTag" :type="type">
      <el-tab-pane
        v-for="(item, index) in items"
        :key="index"
        :label="item.label"
        :name="item.name"
        :disabled="item.disabled"
      >
        {{ item.content }}
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, ref, toRefs } from "vue";
import { props } from "./props";
const { n } = createNameSpace("eltabs");
defineOptions({
  name: "mo-eltabs",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const selectTag = ref("1");
const items = computed(
  () =>
    data.value?.items?.[viewport.value] ||
    ([
      {
        content: "User",
        label: "User",
        name: "1",
        disabled: false,
      },
      {
        content: "Config",
        label: "Config",
        name: "2",
        disabled: false,
      },
      {
        content: "Role",
        label: "Role",
        name: "3",
        disabled: true,
      },
      {
        content: "Task",
        label: "Task",
        name: "4",
        disbled: false,
      },
    ] as Array<any>)
);
const type = computed(() => data.value?.type?.[viewport.value] || "");
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
