import type { ComponentViewport } from "@/types/components";
import type { PropType } from "vue";

export type MoCanvasPropsData = {
  canvasData: {
    desktop: string;
    mobile: string;
  };
  lineWidth: {
    desktop: number;
    mobile: number;
  };
  lineColor: {
    desktop: string;
    mobile: string;
  };
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
        desktop: true,
        mobile: true,
      },
      width: {
        desktop: "200px",
        mobile: "200px",
      },
      height: {
        desktop: "295px",
        mobile: "295px",
      },
      color: {
        desktop: "#fff",
        mobile: "#fff",
      },
      lineColor: {
        desktop: "#000000",
        mobile: "#000000",
      },
      lineWidth: {
        desktop: 3,
        mobile: 3,
      },
      canvasData: {
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