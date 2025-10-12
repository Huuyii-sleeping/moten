<template>
  <div :class="classes" :style="displayStyle">
    <!-- ECharts容器 -->
    <div ref="chartRef" class="chart-container" :style="chartStyle"></div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { createNameSpace } from "@/utils/components";
import {
  computed,
  toRefs,
  inject,
  ref,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import { props } from "./props";
import * as echarts from "echarts";
import type { ECharts } from "echarts";

// 组件命名空间
const { n } = createNameSpace("echarts");
defineOptions({
  name: "mo-echarts",
});

// 注入平台信息
const platform = inject("platform");
const propsData = defineProps(props);
const { data, viewport } = toRefs(propsData);

// 图表容器Ref
const chartRef = ref<HTMLDivElement | null>(null);
// ECharts实例
let chartInstance: ECharts | null = null;
// 错误信息
const errorMessage = ref("");

// 响应式配置
const title = computed(() => data.value?.title?.[viewport.value] || "");
const chartType = computed(
  () => data.value?.chartType?.[viewport.value] || "line"
);
const chartDataStr = computed(
  () =>
    data.value?.chartData?.[viewport.value] ||
    JSON.stringify({
      xAxis: ["周一", "周二", "周三", "周四", "周五"],
      series: [120, 200, 150, 80, 70],
    })
);
const width = computed(() => data.value?.width?.[viewport.value] || "100%");
const height = computed(() => data.value?.height?.[viewport.value] || "400px");

// 图表样式
const chartStyle = computed(() => ({
  width: width.value,
  height: height.value,
}));

// 解析图表数据
const parseChartData = (dataStr: string) => {
  try {
    if (!dataStr) return null;
    const data = JSON.parse(dataStr);
    // 验证数据结构
    if (!data.xAxis || !data.series) {
      throw new Error("数据格式错误，需包含xAxis和series字段");
    }
    return data;
  } catch (err) {
    errorMessage.value = `数据解析错误: ${
      err instanceof Error ? err.message : "无效的JSON格式"
    }`;
    return null;
  }
};

// 更新图表配置（核心：支持局部更新）
const updateChartOption = (option: echarts.EChartsOption) => {
  if (chartInstance) {
    chartInstance.setOption(option, {
      notMerge: false, // 合并配置，而非替换
      lazyUpdate: false, // 立即更新
    });
  }
};

// 生成图表配置项
const getChartOption = () => {
  const chartData = parseChartData(chartDataStr.value);
  if (!chartData) return null;

  return {
    title: title.value ? { text: title.value } : null,
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.xAxis,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: chartData.series,
        type: chartType.value,
        smooth: chartType.value === "line",
        itemStyle: {
          color: "#38bdf8",
        },
      },
    ],
  };
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  // 销毁已有实例
  if (chartInstance) {
    chartInstance.dispose();
  }

  // 创建新实例
  chartInstance = echarts.init(chartRef.value);

  // 清空错误信息
  errorMessage.value = "";

  // 设置完整配置
  const option = getChartOption();
  if (option) {
    chartInstance.setOption(option);
  }
};

// 监听窗口大小变化，重绘图表
const handleResize = () => {
  chartInstance?.resize();
};

// 核心修复：监听所有配置变化（包括title）
watch(
  [title, chartType, chartDataStr, width, height, viewport],
  (newValues, oldValues) => {
    // 优化：只更新变化的部分，提升性能
    const [newTitle, newType, newDataStr] = newValues;
    const [oldTitle, oldType, oldDataStr] = oldValues;

    if (!chartInstance) {
      initChart();
      return;
    }

    // 标题变化时，只更新title配置
    if (newTitle !== oldTitle) {
      updateChartOption({
        title: newTitle ? { text: newTitle } : ("" as any),
      });
    }

    // 图表类型变化时，只更新series.type
    if (newType !== oldType) {
      const chartData = JSON.parse(newDataStr);
      if (!chartData) return;
      updateChartOption({
        series: [
          {
            type: newType,
            data: chartData.series,
            smooth: newType === "line",
          },
        ] as any,
      });
    }

    // 数据或尺寸变化时，重新初始化图表
    if (
      newDataStr !== oldDataStr ||
      newValues[3] !== oldValues[3] ||
      newValues[4] !== oldValues[4]
    ) {
      initChart();
    }
  },
  { deep: true }
);

// 显示控制
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

// 组件类名
const classes = computed(() => [n()]);

// 生命周期
onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped lang="scss">
.chart-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  text-align: center;
}

.chart-container {
  background-color: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  padding: 16px;
  text-align: center;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
