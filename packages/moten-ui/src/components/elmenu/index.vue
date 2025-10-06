<template>
  <div :class="classes">
    <el-menu :mode="mode" :collapse="collapse">
      <template v-for="item in items">
        <menu-node
          :content="item.content"
          :disabled="item.disabled"
          :children="item.children"
          :viewport="viewport"
        />
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs } from "vue";
import { props } from "./props";
import MenuNode from "./menu-item.vue";
interface MenuItem {
  content: string;
  disabled: boolean;
  children?: MenuItem[];
}
const { n } = createNameSpace("elmenu");
defineOptions({
  name: "mo-elmenu",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const collapse = computed(
  () => data.value?.collapse?.[viewport.value] || false
);
const mode = computed(() => data.value?.mode?.[viewport.value] || "horizontal");
const items = computed(
  () =>
    data.value?.items?.[viewport.value] ||
    ([
      {
        content: "test1",
        disabled: false,
      },
      {
        content: "test2",
        disabled: false,
        children: [
          {
            content: "test2-1",
            disabled: false,
          },
          {
            content: "test2-2",
            disabled: true,
          },
        ],
      },
      {
        content: "test3",
        disabled: true,
      },
    ] as Array<MenuItem>)
);
</script>

<style scoped lang="scss"></style>
