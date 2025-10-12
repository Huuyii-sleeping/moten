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
const percentage = Type.String({
  code: "config-input",
  title: "百分比",
  default: "50",
  minLength: 1,
  errorMessage: {
    required: "最少1个字符",
    minLength: "最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "最少1个字符", trigger: "change" },
  ],
});
const status = Type.String({
  code: "config-dropdown",
  title: "状态",
  default: "",
  select: ["success", "warning", "exception", "default"],
});

const type = Type.String({
  code: "config-dropdown",
  title: "类型",
  default: "line",
  select: ["line", "circle", "dashboard"],
});
const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "100%",
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
  default: "295px",
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
  percentage: schemaAllViewport(percentage),
  status: schemaAllViewport(status),
  type: schemaAllViewport(type),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
});

export type MoImageSchema = Static<typeof schema>;

export default schema;
