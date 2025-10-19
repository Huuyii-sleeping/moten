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

const color = Type.String({
  code: "config-color",
  title: "背景色",
  default: "transparent",
  placeholder: "请选择颜色",
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
  default: "200px", // 默认高度
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

const code = Type.String({
  code: "config-code", 
  title: "自定义代码",
  default: "// 在这里写 JavaScript 代码\nconsole.log('Hello from custom code!');",
  placeholder: "请输入代码",
});

const schema = Type.Object({
  display: schemaAllViewport(display),
  color: schemaAllViewport(color),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
  code: schemaAllViewport(code), 
});

export type MoCustomCodeSchema = Static<typeof schema>;

export default schema;