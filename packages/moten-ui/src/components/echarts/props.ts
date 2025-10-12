import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

/**
 * ECharts图表组件的属性数据结构
 */
export type MoEChartsPropsData = {
  display?: {
    desktop: boolean;
    mobile: boolean;
  };
  title?: {
    desktop: string;
    mobile: string;
  };
  chartType?: {
    desktop: string;
    mobile: string;
  };
  chartData?: {
    desktop: string;
    mobile: string;
  };
  width?: {
    desktop: string;
    mobile: string;
  };
  height?: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoEChartsPropsData>,
    default: () => ({
      display: {
        desktop: true,
        mobile: true,
      },
      title: {
        desktop: "数据图表",
        mobile: "数据图表",
      },
      chartType: {
        desktop: "line",
        mobile: "line",
      },
      chartData: {
        desktop:
          '{"xAxis": ["周一", "周二", "周三", "周四", "周五"], "series": [120, 200, 150, 80, 70]}',
        mobile:
          '{"xAxis": ["周一", "周二", "周三", "周四", "周五"], "series": [120, 200, 150, 80, 70]}',
      },
      width: {
        desktop: "100%",
        mobile: "100%",
      },
      height: {
        desktop: "400px",
        mobile: "300px", // 移动端高度略小
      },
    }),
  },
  viewport: {
    type: String as PropType<ComponentViewport>,
    default: "desktop",
    validator(val: string) {
      return ["desktop", "mobile"].includes(val);
    },
  },
};
