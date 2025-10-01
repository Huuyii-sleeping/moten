import { schemaAllViewport } from "@/utils/components";
import { Type } from "typebox";

const display = Type.String({
  code: "config-viewport",
  title: "屏幕",
  default: true,
  errorMessage: {
    required: "选择一项即可",
  },
  rules: [{ required: true, message: "选择一项即可", trigger: "change" }],
});

const color = Type.String({
  code: "config-color",
  title: "背景",
  default: "#fff",
});

const height = Type.String({
  code: "config-input",
  title: "高度",
  default: "295px",
});

const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "100%",
});

const schema = Type.Object({
  display: schemaAllViewport(display),
  color: schemaAllViewport(color),
  height: schemaAllViewport(height),
  width: schemaAllViewport(width),
});

export default schema;
