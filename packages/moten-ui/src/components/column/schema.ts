import { schemaAllViewport } from "@/utils/components";
import { Type } from "typebox";

const color = Type.String({
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
  color: schemaAllViewport(color),
  cols: schemaAllViewport(cols),
});

export default schema
