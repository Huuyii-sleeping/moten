import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoImagePropsData = {
  display?: {
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
  items?: {
    desktop: Array<any>;
    mobile: Array<any>;
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
      items: {
        desktop: [],
        mobile: [],
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
