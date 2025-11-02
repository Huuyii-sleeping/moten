<template>
  <div :class="classes" :style="[displayStyle, styles]">
    <div class="slide-container" v-if="items.length > 0">
      <div
        class="slide-track"
        :style="{
          transform: `translateX(${-currentIndex * 100}%)`,
          transition: `transform 0.5s ease-in-out`,
        }"
      >
        <div v-for="(item, index) in items" :key="index" class="slide-item">
          <img :src="item" />
        </div>
      </div>
      <div v-if="items.length > 1" class="indicators">
        <span
          v-for="(_, index) in items"
          :key="index"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
        ></span>
      </div>
    </div>
    <div v-else class="no-image" :style="styles">
      <mo-empty description="请上传幻灯片素材"></mo-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject, ref, onMounted, watch } from "vue";
import { props } from "./props";
import MoEmpty from "@/components/empty";

const { n } = createNameSpace("carousel");
defineOptions({
  name: "mo-slide",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const classes = computed(() => [n()]);
const width = computed(() => data.value?.width?.[viewport.value] || "300px");
const height = computed(() => data.value?.height?.[viewport.value] || "200px");
const styles = computed(() => ({
  width: width.value,
  height: height.value,
  backgroundColor: "#ffffff",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
}));
const items = computed(() => data.value?.items?.[viewport.value] || []);
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

const currentIndex = ref(0);
let timer: any = null;

watch(items, () => {
  currentIndex.value = 0;
  stopTimer();
  startTimer();
});

const startTimer = () => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % items.value.length;
  }, 2000);
};

const stopTimer = () => {
  clearInterval(timer);
  timer = null;
};

const goTo = (index: number) => {
  currentIndex.value = index;
  stopTimer();
  startTimer();
};
onMounted(() => startTimer());
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
