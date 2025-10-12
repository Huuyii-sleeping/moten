<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <el-table :data="tableData" style="height: 100%">
      <el-table-column
        v-for="(_, index) in keys"
        :key="index"
        :prop="keys[index]"
        :label="labels[index]"
        :width="widths[index]"
      />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject, watch } from "vue";
import { props } from "./props";

const { n } = createNameSpace("eltable");
defineOptions({
  name: "mo-eltable",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
watch(
  () => data.value,
  () => {
    console.log("data:", data.value);
  },
  { deep: true }
);

const classes = computed(() => [n()]);
const width = computed(() => data.value?.width?.[viewport.value] || "100%");
const height = computed(() => data.value?.height?.[viewport.value] || "295px");
const tableConfig = computed(() => {
  return (
    data.value?.tableConfig?.[viewport.value] || {
      columns: [
        { prop: "date", label: "日期", width: "180" },
        { prop: "name", label: "名称", width: "180" },
        { prop: "address", label: "地址" },
      ],
      tableData: [
        { date: "2024-01-01", name: "测试1", address: "地址1" },
        { date: "2024-01-02", name: "测试2", address: "地址2" },
      ],
    }
  );
});
const keys = computed(() => {
  let keys = [] as any;
  tableConfig.value.columns.forEach((table: any) => {
    keys.push(table.prop);
  });
  return keys;
});
const labels = computed(() => {
  let labels = [] as any;
  tableConfig.value.columns.forEach((table: any) => {
    labels.push(table.label);
  });
  return labels;
});
const widths = computed(() => {
  let widths = [] as any;
  tableConfig.value.columns.forEach((table: any) => {
    widths.push(table.width);
  });
  return widths;
});
const tableData = computed(() => tableConfig.value.tableData);
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

<style scoped lang="scss">
@import "./index.scss";
</style>
