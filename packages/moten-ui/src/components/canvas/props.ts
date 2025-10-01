import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoCanvasPropsData = {
  color: {
    desktop: string;
    mobile: string;
  };
  height: {
    desktop: string;
    mobile: string;
  };
  width: {
    desktop: string;
    mobile: string;
  };
  display: {
    desktop: boolean;
    mobile: boolean;
  };
};

export type MoCanvasPropsList = any[];

export const props = {
  data: {
    type: Object as PropType<MoCanvasPropsData>,
    default: () => ({
      display: {
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
      color: {
        desktop: "",
        mobile: "",
      },
    }),
  },
  children: {
    type: Array as PropType<MoCanvasPropsList>,
    default: () => [],
  },
  viewport: {
    type: String as PropType<ComponentViewport>,
    default: "desktop",
    validator(val: string) {
      return ["desktop", "mobile"].includes(val);
    },
  },
};
