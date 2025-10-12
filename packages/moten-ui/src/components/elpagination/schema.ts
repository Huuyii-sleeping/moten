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
const total = Type.Number({
  code: "config-input",
  title: "总数",
  default: 10,
  minLength: 1,
  errorMessage: {
    required: "最少1个字符",
    minLength: "最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "最少1个字符", trigger: "change" },
  ],
});
const seque = Type.String({
  code: "config-input",
  title: "展示顺序",
  default: "prev, pager, next",
  placeholder: "请输入展示顺序",
  minLength: 1,
  errorMessage: {
    required: "最少1个字符",
    minLength: "最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "最少1个字符", trigger: "change" },
  ],
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
const disabled = Type.Boolean({
  code: "config-select",
  title: "是否禁用",
  default: false,
});

const schema = Type.Object({
  display: schemaAllViewport(display),
  total: schemaAllViewport(total),
  seque: schemaAllViewport(seque),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
  disabled: schemaAllViewport(disabled),
});

export type MoImageSchema = Static<typeof schema>;

export default schema;
