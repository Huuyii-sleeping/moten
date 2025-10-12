import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

/**
 * 抽屉组件属性数据结构
 * 支持桌面端（desktop）和移动端（mobile）差异化配置
 */
export type MoDrawerPropsData = {
  // 抽屉显示/隐藏状态
  visible?: {
    desktop: boolean;
    mobile: boolean;
  };
  // 抽屉标题
  title?: {
    desktop: string;
    mobile: string;
  };
  // 抽屉内容
  content?: {
    desktop: string;
    mobile: string;
  };
  // 弹出方向（top/right/bottom/left）
  direction?: {
    desktop: string;
    mobile: string;
  };
  // 尺寸（横向用宽度，纵向用高度）
  size?: {
    desktop: string;
    mobile: string;
  };
  // 是否显示遮罩
  withMask?: {
    desktop: boolean;
    mobile: boolean;
  };
  height?: {
    desktop: string;
    mobile: string;
  };
  width?: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoDrawerPropsData>,
    default: () => ({
      visible: {
        desktop: false,
        mobile: false,
      },
      title: {
        desktop: "抽屉面板",
        mobile: "抽屉面板",
      },
      content: {
        desktop: "抽屉面板内容描述...",
        mobile: "抽屉面板内容描述...",
      },
      direction: {
        desktop: "ltr", // 桌面端默认右侧弹出
        mobile: "ltr", // 移动端默认底部弹出（更适配小屏幕）
      },
      size: {
        desktop: "30%",
        mobile: "70%", // 移动端尺寸占比更大
      },
      withMask: {
        desktop: true,
        mobile: true,
      },
      height: {
        desktop: "",
        mobile: "",
      },
      width: {
        desktop: "",
        mobile: "",
      },
    }),
  },
  viewport: {
    type: String as PropType<ComponentViewport>,
    default: "desktop",
    validator: (val: string) => ["desktop", "mobile"].includes(val),
  },
};
