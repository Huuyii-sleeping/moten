import Type, { type Static } from "typebox";
import { schemaAllViewport } from "@/utils/components";

const display = Type.Boolean({
  code: "config-viewport",
  title: "屏幕",
  default: true,
  errorMessage: {
    required: "选择一项即可",
  },
  rules: [{ required: true, message: "选择一项即可", trigger: "change" }],
});

const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "200px",
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

const color = Type.String({
  code: "config-color",
  title: "背景颜色",
  default: "",
});

const content = Type.String({
  code: "config-richtext",
  title: "内容",
  default: "",
  placeholder: "请输入内容",
  minLength: 1,
  errorMessage: {
    required: "最少需要1个字符",
    minLength: "最少需要1个字符",
  },
  rules: [
    { required: true, min: 1, message: "最少需要1个字符", trigger: "change" },
  ],
});

const schema = Type.Object({
  display: schemaAllViewport(display),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
  color: schemaAllViewport(color),
  content: schemaAllViewport(content),
});

export type MoVideoSchema = Static<typeof schema>;
export default schema;
