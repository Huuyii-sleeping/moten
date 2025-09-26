import Type from "typebox";
import { schemaAllViewport } from "@/utils/components";

const display = Type.Boolean({
  code: "config-viewport",
  title: "屏幕",
  default: "",
});

const src = Type.String({
  code: "config-files",
  title: "图片",
  default: "",
});

const link = Type.String({
  code: "config-input",
  title: "链接",
  default: "",
});

const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "",
});

const height = Type.String({
  code: "config-input",
  title: "高度",
  default: "",
});

const schema = Type.Object({
  display: schemaAllViewport(display),
  src: schemaAllViewport(src),
  link: schemaAllViewport(link),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
});

export default schema;
