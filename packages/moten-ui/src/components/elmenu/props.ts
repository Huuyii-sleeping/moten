import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

/**
 * 标注图片的信息
 */
export type MoElmenuPropsData = {
  mode?: {
    desktop: string;
    mobile: string;
  };
  collapse?: {
    desktop: false;
    mobile: false;
  };
  items?: {
    desktop: [];
    mobile: [];
  };
};

export const props = {
  data: {
    type: Object as PropType<MoElmenuPropsData>,
    default: () => ({
      items: {
        desktop: [],
        mobile: [],
      },
      collapse: {
        desktop: false,
        mobile: false,
      },
      mode: {
        desktop: 'horizontal',
        mobile: 'horizontal'
      }
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
