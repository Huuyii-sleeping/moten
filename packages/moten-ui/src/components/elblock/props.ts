import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoImagePropsData = {
  placeholder: {
    desktop: string;
    mobile: string;
  };
  size: {
    desktop: string;
    mobile: string;
  };
  title: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoImagePropsData>,
    default: () => ({
      placeholder: {
        desktop: "",
        mobile: "",
      },
      size: {
        desktop: "",
        mobile: "",
      },
      title: {
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
