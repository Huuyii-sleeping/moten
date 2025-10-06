import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoEldropdownPropsData = {
  title?: {
    desktop: string;
    mobile: string;
  };
  content?: {
    desktop: string;
    mobile: string;
  };
  width?: {
    desktop: string;
    mobile: string;
  };
  confirmText?: {
    desktop: string;
    mobile: string;
  };
  cancelText?: {
    desktop: string;
    mobile: string;
  };
  mount?: {
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
        desktop: String,
        mobile: String,
      },
      content: {
        desktop: String,
        mobile: String,
      },
      width: {
        desktop: String,
        mobile: String,
      },
      confirmText: {
        desktop: String,
        mobile: String,
      },
      cancelText: {
        desktop: String,
        mobile: String,
      },
      mount: {
        desktop: String,
        mobile: String,
      },
      mountContent: {
        desktop: String,
        mobile: String,
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
