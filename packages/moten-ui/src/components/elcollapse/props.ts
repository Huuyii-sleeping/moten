import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

/**
 * 折叠面板组件的属性数据结构
 */
export type MoCollapsePropsData = {
  display?: {
    desktop: boolean;
    mobile: boolean;
  };
  title?: {
    desktop: string;
    mobile: string;
  };
  content?: {
    desktop: string;
    mobile: string;
  };
  defaultExpanded?: {
    desktop: boolean;
    mobile: boolean;
  };
  width?: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoCollapsePropsData>,
    default: () => ({
      display: {
        desktop: true,
        mobile: true,
      },
      title: {
        desktop: "折叠面板",
        mobile: "折叠面板",
      },
      content: {
        desktop: "折叠面板内容描述...",
        mobile: "折叠面板内容描述...",
      },
      defaultExpanded: {
        desktop: false,
        mobile: false,
      },
      width: {
        desktop: "100%",
        mobile: "100%",
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