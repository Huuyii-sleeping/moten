import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoColumnPropsData = {
  // 列数
  cols?: {
    desktop: number[];
    mobile: number[];
  };
  // 背景
  background: {
    desktop: string;
    mobile: string;
  };
};

export type MoColumnPropsList = {
  desktop: any[][];
  mobile: any[][];
};

export const props = {
  data: {
    type: Object as PropType<MoColumnPropsData>,
    default: () => ({
      cols: {
        desktop: [0.5, 0.5],
        mobile: [0.5, 0.5],
      },
      background: {
        desktop: "",
        mobile: "",
      },
    }),
  },
  children: {
    type: Object as PropType<MoColumnPropsList>,
    default: () => ({
      desktop: [[], []],
      mobile: [[], []],
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
