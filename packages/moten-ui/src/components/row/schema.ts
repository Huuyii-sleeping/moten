import { schemaAllViewport } from "@/utils/components";
import { Type } from "typebox";

const color = Type.String({
  code: "config-color",
  title: "背景",
  default: "#fff",
});

const rows = Type.Array(Type.Number(), {
  code: "config-row",
  title: "行数",
  default: 0.5,
  minItems: 2,
  maxItems: 4,
});

const schema = Type.Object({
  color: schemaAllViewport(color),
  rows: schemaAllViewport(rows),
});

export default schema
