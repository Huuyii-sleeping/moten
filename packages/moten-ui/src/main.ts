import "./assets/styles/index.scss";

import MoImage from "@/components/image";
import MoColumn from '@/components/column'

import imageSchema from "@/components/image/schema";
import columnSchema from '@/components/column/schema'

import { schemaAllViewport as _schemaAllViewport } from "./utils/components";
import { COMPONENT_PREFIX as _COMPONENT_PREFIX } from "./config";
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
  column: columnSchema,
};

export const schemaAllViewport = _schemaAllViewport;
export const COMPONENT_PREFIX = _COMPONENT_PREFIX

export default { install, MoImage, MoColumn };
