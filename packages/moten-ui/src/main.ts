import "./assets/styles/index.scss";

import MoImage from "@/components/image";
import MoColumn from "@/components/column";
import MoVideo from "@/components/video";
import MoTextarea from "@/components/textarea";
import MoSlide from "@/components/carousel";
import MoBlank from "@/components/blank";
import MoRow from "@/components/row";
import MoCanvas from "@/components/canvas";
import MoElDropdown from "@/components/eldropdown";
import MoElBlock from "@/components/elblock";
import MoElMenu from "@/components/elmenu";
import MoElTabs from "@/components/eltabs";
import MoElBreadcrumb from "@/components/elbreadcrumb";
import MoElTable from "@/components/eltable";
import MoElDialog from "@/components/eldialog";
import MoElNotification from "@/components/elnotification";
import MoCustomCode from "@/components/customcode";
import MoElPagination from "@/components/elpagination";
import MoElProgress from "@/components/elprogress";
import MoElCard from "@/components/elcard";
import MoElCollapse from "@/components/elcollapse";
import MoElDrawer from "@/components/eldarwer";

import imageSchema from "@/components/image/schema";
import columnSchema from "@/components/column/schema";
import videoSchema from "@/components/video/schema";
import textareaSchema from "@/components/textarea/schema";
import slideSchema from "@/components/carousel/schema";
import blankSchema from "@/components/blank/schema";
import rowSchema from "@/components/row/schema";
import canvasSchema from "@/components/canvas/schema";
import eldropdownSchema from "@/components/eldropdown/schema";
import elblockSchema from "@/components/elblock/schema";
import elmenuSchema from "@/components/elmenu/schema";
import eltabsSchema from "@/components/eltabs/schema";
import elbreadcrumb from "@/components/elbreadcrumb/schema";
import eldialogSchema from "@/components/eldialog/schema";
import elnotificationSchema from "@/components/elnotification/schema";
import eltableSchema from "@/components/eltable/schema";
import customcodeSchema from "@/components/customcode/schema";
import elpaginationSchema from "@/components/elpagination/schema";
import elprogressSchema from "@/components/elprogress/schema";
import elcardSchema from "@/components/elcard/schema";
import elcollapseSchema from "@/components/elcollapse/schema";
import eldrawerSchema from "@/components/eldarwer/schema";

import { schemaAllViewport as _schemaAllViewport } from "./utils/components";
import { COMPONENT_PREFIX as _COMPONENT_PREFIX } from "./config";
import type { App } from "vue";

const components = [
  MoImage,
  MoColumn,
  MoVideo,
  MoTextarea,
  MoSlide,
  MoBlank,
  MoRow,
  MoCanvas,
  MoElDropdown,
  MoElBlock,
  MoElMenu,
  MoElTabs,
  MoElBreadcrumb,
  MoElDialog,
  MoElNotification,
  MoCustomCode,
  MoElTable,
  MoElPagination,
  MoElProgress,
  MoElCard,
  MoElCollapse,
  MoElDrawer,
];

const install = (
  app: App,
  options: {
    platform: "editor" | "user";
  }
) => {
  components.forEach((component) => {
    const { name } = component;
    if (name) app.component(name, component);
  });
  app.provide("platform", options.platform);
};

export const schema = {
  image: imageSchema,
  column: columnSchema,
  video: videoSchema,
  textarea: textareaSchema,
  slide: slideSchema,
  blank: blankSchema,
  row: rowSchema,
  canvas: canvasSchema,
  eldropdown: eldropdownSchema,
  elblock: elblockSchema,
  elmenu: elmenuSchema,
  eltabs: eltabsSchema,
  elbreadcrumb: elbreadcrumb,
  eldialog: eldialogSchema,
  elnotification: elnotificationSchema,
  customcode: customcodeSchema,
  eltable: eltableSchema,
  elpagination: elpaginationSchema,
  elprogress: elprogressSchema,
  elcard: elcardSchema,
  elcollapse: elcollapseSchema,
  eldrawer: eldrawerSchema,
};

export const schemaAllViewport = _schemaAllViewport;
export const COMPONENT_PREFIX = _COMPONENT_PREFIX;

export default {
  install,
  MoImage,
  MoColumn,
  MoVideo,
  MoTextarea,
  MoSlide,
  MoBlank,
  MoRow,
  MoCanvas,
  MoElDropdown,
  MoElBlock,
  MoElMenu,
  MoElTabs,
  MoElBreadcrumb,
  MoElDialog,
  MoElNotification,
  MoCustomCode,
  MoElTable,
  MoElPagination,
  MoElProgress,
  MoElCard,
  MoElCollapse,
  MoElDrawer,
};
