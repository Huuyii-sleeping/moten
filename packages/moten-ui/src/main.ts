import "./style.css";

import MoImg from "./components/mo-img.vue";

import imageSchema from "@/components/image/schema";

import { schemaAllViewport as _schemaAllViewport } from "./utils/components";

export const schema = {
    image: imageSchema,
}

export const schemaAllViewport = _schemaAllViewport

export default { MoImg };
