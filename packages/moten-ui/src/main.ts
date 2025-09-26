import "./assets/styles/index.scss";

import MoImage from "@/components/image";

import imageSchema from "@/components/image/schema";

import { schemaAllViewport as _schemaAllViewport } from "./utils/components";
import type { App } from "vue";

const components = [MoImage];

const install = (app: App) => {
  components.forEach((component) => {
    const { name } = component;
    if (name) app.component(name, component);
  });
};

export const schema = {
  image: imageSchema,
};

export const schemaAllViewport = _schemaAllViewport;

export default { install, MoImage };
