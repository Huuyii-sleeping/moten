import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

/**
 * 卡片组件的属性数据结构
 */
export type MoCardPropsData = {
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
  link?: {
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
    type: Object as PropType<MoCardPropsData>,
    default: () => ({
      display: {
        desktop: true,
        mobile: true,
      },
      title: {
        desktop: "卡片标题",
        mobile: "卡片标题",
      },
      content: {
        desktop: "卡片内容描述...",
        mobile: "卡片内容描述...",
      },
      link: {
        desktop: "",
        mobile: "",
      },
      width: {
        desktop: "300px",
        mobile: "100%", // 移动端默认占满宽度
      },
      height: {
        desktop: "200px",
        mobile: "180px", // 移动端高度略小
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
