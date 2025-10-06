<template>
  <div :class="classes">
    <component @click="open" :is="mount">{{ mountContent }}</component>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, toRefs } from "vue";
import { props } from "./props";
import { ElNotification } from "element-plus";
const { n } = createNameSpace("elnotification");
defineOptions({
  name: "mo-elnotification",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const message = computed(
  () => data.value?.message?.[viewport.value] || "dialog"
);
const title = computed(
  () => data.value?.title?.[viewport.value] || "this is a message"
);
const position = computed(
  () => data.value?.position?.[viewport.value] || "top-right"
) as any;
const mount = computed(
  () => data.value?.mount?.[viewport.value] || "el-button"
);
const mountContent = computed(
  () => data.value?.mountContent?.[viewport.value] || "Notification"
);
const duration = computed(() => data.value?.duration?.[viewport.value] || 2000);
const classes = computed(() => [n()]);
const open = () => {
  ElNotification({
    title: title.value,
    message: message.value,
    duration: duration.value,
    position: position.value,
  });
};
</script>

<style scoped lang="scss"></style>
