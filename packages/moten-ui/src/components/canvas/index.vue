<template>
  <div
    :class="classes"
    :style="[displayStyle, styles]"
    class="mo-canvas-wrapper"
  >
    <!-- 编辑器模式：显示可绘制画布 + 工具栏 -->
    <div v-if="isEditor" class="drawing-area" :style="styles">
      <canvas
        ref="drawCanvas"
        class="drawing-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="stopDrawing"
      ></canvas>

      <!-- 穀底工具栏 -->
      <div class="canvas-toolbar">
        <button @click="isEraser = false" :class="{ active: !isEraser }">
          ✏️
        </button>
        <button @click="isEraser = true" :class="{ active: isEraser }">
          🧽
        </button>
        <button @click="clearCanvas">🗑️</button>
      </div>

      <!-- 空提示 -->
      <div v-if="!hasCanvasData" class="empty-hint">点击画布开始绘制</div>
    </div>

    <!-- 预览模式：显示已保存的图像 或 children -->
    <div v-else class="preview-area" :style="styles">
      <!-- 优先显示已绘制的图像 -->
      <img
        v-if="hasCanvasData"
        :src="canvasDataUrl"
        class="saved-canvas-image"
        alt="绘制内容"
      />
      <!-- 否则渲染 children（兼容原有逻辑） -->
      <div v-for="(item, index) in children" :key="index" class="child-slot">
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, toRefs, ref, onMounted, watch } from "vue";
import { props } from "./props";
import { createNameSpace } from "@/utils/components";

const { n } = createNameSpace("canvas");
defineOptions({ name: "mo-canvas" });

const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport, children } = toRefs(propsData);
const emit = defineEmits(["update:data"]);

// ===== 状态 =====
const isEditor = computed(() => platform === "editor");
const drawCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const lastPos = ref({ x: 0, y: 0 });
const isEraser = ref(false);

// ===== 响应式数据 =====
const width = computed(() => data.value?.width?.[viewport.value] || "200px");
const height = computed(() => data.value?.height?.[viewport.value] || "295px");
const color = computed(() => data.value?.color?.[viewport.value] || "#ffffff");
const lineColor = computed(
  () => data.value?.lineColor?.[viewport.value] || "#000000"
);
const lineWidth = computed(() => data.value?.lineWidth?.[viewport.value] || 3);

const canvasDataUrl = computed(
  () => data.value?.canvasData?.[viewport.value] || ""
);
const hasCanvasData = computed(() => !!canvasDataUrl.value);

const styles = computed(() => ({
  width: width.value,
  height: height.value,
  backgroundColor: color.value,
}));

const display = computed(() => {
  const d = data.value?.display?.[viewport.value];
  return typeof d === "boolean" ? d : true;
});

const displayStyle = computed(() => {
  if (platform === "editor") {
    return !display.value ? { opacity: 0.4, filter: "brightness(0.7)" } : {};
  } else {
    return !display.value ? { display: "none" } : {};
  }
});

const classes = computed(() => [n()]);

// ===== 绘图方法 =====
const initCanvas = () => {
  const canvas = drawCanvas.value;
  if (!canvas || !isEditor.value) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // 设置 canvas 的实际像素尺寸（避免模糊 + 确保坐标系一致）
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const context = canvas.getContext("2d");
  if (context) {
    ctx.value = context;
    // 不要 scale！保持 1:1 像素比，靠 getPos 换算
  }

  // 加载已有图像...
};

const getPos = (e: MouseEvent | TouchEvent) => {
  const canvas = drawCanvas.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect(); // CSS 布局尺寸
  const scaleX = canvas.width / rect.width; // 实际像素 / CSS 像素
  const scaleY = canvas.height / rect.height;

  let x = 0,
    y = 0;
  if (e instanceof MouseEvent) {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  } else if (e.touches?.[0]) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  }

  // 转换为 Canvas 内部的实际绘图坐标
  return {
    x: x * scaleX,
    y: y * scaleY,
  };
};

const startDrawing = (e: MouseEvent) => {
  if (!ctx.value) return;
  isDrawing.value = true;
  const pos = getPos(e);
  lastPos.value = pos;
  ctx.value.beginPath();
  ctx.value.moveTo(pos.x, pos.y);
};

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value) return;
  const pos = getPos(e);
  const strokeColor = isEraser.value ? color.value : lineColor.value;
  const strokeW = isEraser.value
    ? Math.max(lineWidth.value * 3, 16)
    : lineWidth.value;

  ctx.value.strokeStyle = strokeColor;
  ctx.value.lineWidth = strokeW;
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";
  ctx.value.lineTo(pos.x, pos.y);
  ctx.value.stroke();
  lastPos.value = pos;
};

const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false;
    // 保存数据
    if (drawCanvas.value) {
      const url = drawCanvas.value.toDataURL("image/png");
      emit("update:data", {
        ...data.value,
        canvasData: { ...data.value?.canvasData, [viewport.value]: url },
        lineColor: {
          ...data.value?.lineColor,
          [viewport.value]: lineColor.value,
        },
        lineWidth: {
          ...data.value?.lineWidth,
          [viewport.value]: lineWidth.value,
        },
      });
    }
  }
};

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  if (e.touches.length > 0) startDrawing(e.touches[0] as unknown as MouseEvent);
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  draw(e);
};

const clearCanvas = () => {
  if (!ctx.value || !drawCanvas.value) return;
  const parent = drawCanvas.value.parentElement;
  if (parent) {
    ctx.value.clearRect(0, 0, parent.clientWidth, parent.clientHeight);
  }
  emit("update:data", {
    ...data.value,
    canvasData: { ...data.value?.canvasData, [viewport.value]: "" },
  });
};

// ===== 生命周期 =====
onMounted(() => {
  if (isEditor.value) {
    initCanvas();
  }
});

// 监听 viewport 切换（重新初始化画布）
watch(
  () => viewport.value,
  () => {
    if (isEditor.value) {
      setTimeout(initCanvas, 0);
    }
  }
);
</script>

<style scoped lang="scss">
.mo-canvas-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-sizing: border-box;
}

.drawing-area,
.preview-area {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.drawing-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  margin: 0;
  padding: 0;
  border: none;
}

.saved-canvas-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.child-slot {
  width: 100%;
  height: 100%;
}

.empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px 16px;
  border-radius: 16px;
  pointer-events: none;
}

.canvas-toolbar {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.canvas-toolbar button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  cursor: pointer;
  font-size: 14px;
}

.canvas-toolbar button.active {
  background: #3b82f6;
  color: white;
}
</style>
