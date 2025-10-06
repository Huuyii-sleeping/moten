import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoEldropdownPropsData = {
  title?: {
    desktop: string;
    mobile: string;
  };
  message?: {
    desktop: string;
    mobile: string;
  };
  duration?: {
    desktop: number;
    mobile: number;
  };
  mount?: {
    desktop: string;
    mobile: string;
  };
  position?: {
    desktop: string;
    mobile: string;
  };
  mountContent?: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoEldropdownPropsData>,
    default: () => ({
      title: {
        desktop: "",
        mobile: "",
      },
      message: {
        desktop: "",
        mobile: "",
      },
      duration: {
        desktop: 2000,
        mobile: 2000,
      },
      mount: {
        desktop: "",
        mobile: "",
      },
      position: {
        desktop: "",
        mobile: "",
      },
      mountContent: {
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
