import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const display = Type.Boolean({
  code: "config-viewport",
  title: "屏幕",
  default: true,
  errorMessage: {
    required: "选择一项即可",
  },
  rules: [{ required: true, message: "选择一项即可", trigger: "change" }],
});

const items = Type.String({
  code: "config-upload",
  title: "上传图片",
  default: [],
});

const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "300px",
  placeholder: "请输入宽度",
  minLength: 1,
  errorMessage: {
    required: "最少1个字符",
    minLength: "最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "最少1个字符", trigger: "change" },
  ],
});

const height = Type.String({
  code: "config-input",
  title: "高度",
  default: "200px",
  placeholder: "请输入高度",
  minLength: 1,
  errorMessage: {
    required: "最少1个字符",
    minLength: "最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "最少1个字符", trigger: "change" },
  ],
});

const schema = Type.Object({
  display: schemaAllViewport(display),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
  items: schemaAllViewport(items),
});

export type MoSlideSchema = Static<typeof schema>;

export default schema;
