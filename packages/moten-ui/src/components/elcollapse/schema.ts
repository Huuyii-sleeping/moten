import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

// 折叠面板标题配置
const title = Type.String({
  code: "config-input",
  title: "面板标题",
  default: "折叠面板",
  minLength: 1,
  errorMessage: {
    required: "标题最少1个字符",
    minLength: "标题最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "标题最少1个字符", trigger: "change" },
  ],
});

// 折叠面板内容配置
const content = Type.String({
  code: "config-textarea",
  title: "面板内容",
  default: "折叠面板内容描述...",
  minLength: 1,
  errorMessage: {
    required: "内容最少1个字符",
    minLength: "内容最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "内容最少1个字符", trigger: "change" },
  ],
});

// 折叠面板是否默认展开配置
const defaultExpanded = Type.Boolean({
  code: "config-checkbox",
  title: "是否默认展开",
  default: false,
  errorMessage: {
    required: "请选择是否默认展开",
  },
  rules: [{ required: true, message: "请选择是否默认展开", trigger: "change" }],
});

// 折叠面板宽度配置
const width = Type.String({
  code: "config-input",
  title: "面板宽度",
  default: "100%",
  placeholder: "请输入宽度（如 300px、100%）",
  minLength: 1,
  errorMessage: {
    required: "宽度最少1个字符",
    minLength: "宽度最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "宽度最少1个字符", trigger: "change" },
  ],
});

// 折叠面板是否显示配置
const display = Type.Boolean({
  code: "config-viewport",
  title: "是否显示",
  default: true,
  errorMessage: {
    required: "请选择是否显示",
  },
  rules: [{ required: true, message: "请选择是否显示", trigger: "change" }],
});

// 整体 schema 定义（支持多端配置）
const schema = Type.Object({
  display: schemaAllViewport(display),
  title: schemaAllViewport(title),
  content: schemaAllViewport(content),
  defaultExpanded: schemaAllViewport(defaultExpanded),
  width: schemaAllViewport(width),
});

export type MoCollapseSchema = Static<typeof schema>;

export default schema;
