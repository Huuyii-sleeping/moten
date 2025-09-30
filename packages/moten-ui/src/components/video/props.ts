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
  posterUrl?: {
    desktop: string;
    mobile: string;
  };
  videoUrl?: {
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
  autoPlay?: {
    desktop: boolean;
    mobile: boolean;
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
      posterUrl: {
        desktop: "",
        mobile: "",
      },
      videoUrl: {
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
      autoPlay: {
        desktop: "",
        module: "",
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
