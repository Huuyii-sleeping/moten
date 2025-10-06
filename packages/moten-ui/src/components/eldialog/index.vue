<template>
  <div :class="classes">
    <component :is="mount" @click="dialogVisible = true"> {{ mountContent }} </component>

    <el-dialog v-model="dialogVisible" :title="title" :width="width">
      <span>{{ content }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ cancelText }}</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            {{ confirmText }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import { computed, ref, toRefs } from "vue";
import { props } from "./props";

const { n } = createNameSpace("eldialog");
defineOptions({
  name: "mo-eldialog",
});
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);
const title = computed(() => data.value?.title?.[viewport.value] || "dialog");
const width = computed(() => data.value?.width?.[viewport.value] || "500px");
const mountContent = computed(
  () => data.value?.mountContent?.[viewport.value] || "Click to open the Dialog"
);
const mount = computed(
  () => data.value?.mount?.[viewport.value] || "el-button"
);
const content = computed(
  () => data.value?.content?.[viewport.value] || "this is a message"
);
const confirmText = computed(
  () => data.value?.confirmText?.[viewport.value] || "Confirm"
);
const cancelText = computed(
  () => data.value?.cancelText?.[viewport.value] || "Cancel"
);
const classes = computed(() => [n()]);
const dialogVisible = ref(false);
</script>

<style scoped lang="scss"></style>
