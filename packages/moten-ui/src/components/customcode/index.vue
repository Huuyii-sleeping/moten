<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <div ref="codeContainer" class="result-container"></div>
    <div
      class="custom-code-placeholder"
      id="custom-code"
      v-if="isCodeEmpty && !error"
    >
      点击右侧配置面板添加代码
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject, ref, watch, nextTick, onMounted } from "vue";
import { props } from "./props";

const { n } = createNameSpace("customcode");
defineOptions({
  name: "mo-customcode",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const codeContainer = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);
const isCodeEmpty = computed(() => !data.value?.code?.[viewport.value]?.trim());
const width = computed(() => data.value?.width?.[viewport.value] || "300px");
const height = computed(() => data.value?.height?.[viewport.value] || "200px");
const color = computed(() => data.value?.color?.[viewport.value] || "#ffffff");
const styles = computed(() => ({
  width: width.value,
  height: height.value,
  backgroundColor: color.value,
}));
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

const executeCode = () => {
  if (codeContainer.value) {
    const code = data.value?.code?.[viewport.value] || "";
    if (!code.trim()) {
      codeContainer.value.innerHTML = "";
      error.value = null;
      return;
    }
    try {
      error.value = null;
      codeContainer.value.innerHTML = "";
      const codeContext = {
        container: codeContainer.value,
        console: {
          log: (...args: any) => {
            console.log("[CustomCode]", ...args);
          },
          error: console.error,
          warn: console.warn,
        },
        formatDate: (date: Date) => date.toLocaleString("zh-CN"),
      };
      // 使用Function构造器
      const fn = new Function(`with(this){${code}}`);
      fn.call(codeContext);
    } catch (e: any) {
      error.value = `代码执行错误：${e.message}`;
      console.error("Custom Error:", e);
    }
  }
};

watch(
  () => data.value?.code?.[viewport.value],
  () => {
    // if (platform !== "editor") {
    nextTick(executeCode);
    // }
  },
  { immediate: true }
);
onMounted(() => {
  //   if (platform !== "editor") {
  executeCode();
  //   }
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
