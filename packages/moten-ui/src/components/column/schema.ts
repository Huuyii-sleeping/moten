import { schemaAllViewport } from "@/utils/components";
import { Type } from "typebox";

const background = Type.String({
  code: "config-color",
  title: "背景",
  default: "#fff",
});

const cols = Type.Array(Type.Number(), {
  code: "config-column",
  title: "列数",
  default: 0.5,
  minItems: 2,
  maxItems: 4,
});

const schema = Type.Object({
  background: schemaAllViewport(background),
  cols: schemaAllViewport(cols),
});

export default schema
