import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

interface dropdownItem {
  content?: string;
  disabled?: boolean;
}

export type MoEldropdownPropsData = {
  items?: {
    desktop: Array<dropdownItem>;
    mobile: Array<dropdownItem>;
  };
  title?: {
    desktop: string;
    mobile: string;
  };
};

export const props = {
  data: {
    type: Object as PropType<MoEldropdownPropsData>,
    default: () => ({
      items: {
        desktop: [],
        mobile: [],
      },
      title: {
        desktop: "dropdown",
        mobile: "dropdown",
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
