<template>
  <div :class="classes" :style="displayStyle">
    <mo-link v-if="link" :to="link" target="_blank" class="card-link">
      <div class="card" :style="styles">
        <div class="card-header">
          <h3 class="card-title">{{ title }}</h3>
        </div>
        <div class="card-content">
          <p>{{ content }}</p>
        </div>
      </div>
    </mo-link>
    <div v-else class="card" :style="styles">
      <div class="card-header">
        <h3 class="card-title">{{ title }}</h3>
      </div>
      <div class="card-content">
        <p>{{ content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs, inject } from "vue";
import { props } from "./props";
import MoLink from "@/components/link";

const { n } = createNameSpace("elcard");
defineOptions({
  name: "mo-elcard",
});
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);

const classes = computed(() => [n()]);
const title = computed(() => data.value?.title?.[viewport.value] || "");
const content = computed(() => data.value?.content?.[viewport.value] || "");
const link = computed(() => data.value?.link?.[viewport.value] || "");
const width = computed(() => data.value?.width?.[viewport.value] || "");
const height = computed(() => data.value?.height?.[viewport.value] || "");
const styles = computed(() => ({ width: width.value, height: height.value }));

const display = computed(() => {
  const display = data.value?.display?.[viewport.value];
  return typeof display === "boolean" ? display : true;
});

// 多端显示控制样式
const displayStyle = computed(() => {
  if (platform === "editor") {
    return !display.value ? { opacity: 0.4, filter: "brightness(0.7)" } : {};
  } else {
    return !display.value ? { display: "none" } : {};
  }
});
</script>

<style scoped lang="scss">
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.card-content {
  padding: 16px;
}

.card-content p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.card-link {
  text-decoration: none;
}
</style>
