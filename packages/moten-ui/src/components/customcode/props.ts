import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoImagePropsData = {
  display: {
    desktop: string;
    mobile: string;
  };
  color: {
    desktop: string;
    mobile: string;
  };
  width: {
    desktop: string;
    mobile: string;
  };
  height: {
    desktop: string;
    mobile: string;
  };
  code: {
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
      color: {
        desktop: "",
        mobile: "",
      },
      height: {
        desktop: "",
        mobile: "",
      },
      width: {
        desktop: "",
        mobile: "",
      },
      code: {
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