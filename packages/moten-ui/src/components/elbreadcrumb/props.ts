import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoImagePropsData = {
  items?: {
    desktop: Array<Object>;
    mobile: Array<Object>;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoImagePropsData>,
    default: () => ({
      items: {
        desktop: [],
        mobile: [],
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
