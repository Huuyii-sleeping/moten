<template>
  <el-sub-menu v-if="props.children && props.children.length > 0">
    <template #title>{{ props.content }}</template>
    <el-menu-item
      :disabled="item.disabled"
      v-for="(item, index) in props.children"
      :key="index"
      >{{ item.content }}</el-menu-item
    >
  </el-sub-menu>
  <el-menu-item v-else :disabled="props.disabled">{{
    props.content
  }}</el-menu-item>
</template>
<script setup lang="ts">
defineOptions({ name: "menu-item" });
const props = defineProps<{
  content: string;
  disabled: boolean;
  children?: Array<any>;
  viewport: string;
}>();
</script>

<style scoped lang="scss"></style>
