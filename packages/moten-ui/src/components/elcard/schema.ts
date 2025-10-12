import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

// 卡片标题配置
const title = Type.String({
  code: "config-input",
  title: "卡片标题",
  default: "卡片标题",
  minLength: 1,
  errorMessage: {
    required: "标题最少1个字符",
    minLength: "标题最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "标题最少1个字符", trigger: "change" },
  ],
});

// 卡片内容配置
const content = Type.String({
  code: "config-textarea",
  title: "卡片内容",
  default: "卡片内容描述...",
  minLength: 1,
  errorMessage: {
    required: "内容最少1个字符",
    minLength: "内容最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "内容最少1个字符", trigger: "change" },
  ],
});

// 卡片链接配置
const link = Type.String({
  code: "config-input",
  title: "卡片跳转链接",
  default: "",
  placeholder: "请输入链接",
  minLength: 1,
  errorMessage: {
    required: "链接最少1个字符",
    minLength: "链接最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "链接最少1个字符", trigger: "change" },
  ],
});

// 卡片宽度配置
const width = Type.String({
  code: "config-input",
  title: "卡片宽度",
  default: "300px",
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

// 卡片高度配置
const height = Type.String({
  code: "config-input",
  title: "卡片高度",
  default: "200px",
  placeholder: "请输入高度（如 200px）",
  minLength: 1,
  errorMessage: {
    required: "高度最少1个字符",
    minLength: "高度最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "高度最少1个字符", trigger: "change" },
  ],
});

// 卡片是否显示配置
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
  link: schemaAllViewport(link),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
});

export type MoCardSchema = Static<typeof schema>;

export default schema;
