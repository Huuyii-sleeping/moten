import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoImagePropsData = {
  type?: {
    desktop: string;
    mobile: string;
  };
  items?: {
    desktop: Array<Object>;
    mobile: Array<Object>;
  };
  editable?: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoImagePropsData>,
    default: () => ({
      type: {
        desktop: "",
        mobile: "",
      },
      items: {
        desktop: [],
        mobile: [],
      },
      editable: {
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
