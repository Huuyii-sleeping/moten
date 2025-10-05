<template>
  <div :class="classes">
    <el-dropdown>
      <span class="el-dropdown-link">
        {{ title }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(item, index) in items"
            :key="index"
            :disabled="item.disabled"
          >
            {{ item.content }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs } from "vue";
import { props } from "./props";

const { n } = createNameSpace("eldropdown");
defineOptions({
  name: "mo-eldropdown",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const title = computed(() => data.value?.title?.[viewport.value] || "dropdown");
const items = computed(() => data.value?.items?.[viewport.value] || []);
const classes = computed(() => [n()]);
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
