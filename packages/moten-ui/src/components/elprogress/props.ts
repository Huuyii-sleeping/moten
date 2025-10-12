import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

/**
 * 标注图片的信息
 */
export type MoImagePropsData = {
  display?: {
    desktop: string;
    mobile: string;
  };
  percentage?: {
    desktop: string;
    mobile: string;
  };
  status?: {
    desktop: string;
    mobile: string;
  };
  type?: {
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
    type: Object as PropType<MoImagePropsData>,
    default: () => ({
      display: {
        desktop: "",
        mobile: "",
      },
      percentage: {
        desktop: "",
        mobile: "",
      },
      status: {
        desktop: "",
        mobile: "",
      },
      type: {
        desktop: "",
        mobile: "",
      },
      width: {
        desktop: "",
        mobile: "",
      },
      height: {
        desktop: "",
        mobile: "",
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
