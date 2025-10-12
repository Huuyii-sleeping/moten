import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

// 抽屉是否显示配置（控制抽屉展开/收起）
const visible = Type.Boolean({
  code: "config-select",
  title: "是否显示抽屉",
  default: false,
  errorMessage: {
    required: "请选择抽屉显示状态",
  },
  rules: [{ required: true, message: "请选择抽屉显示状态", trigger: "change" }],
});

// 抽屉标题配置
const title = Type.String({
  code: "config-input",
  title: "抽屉标题",
  default: "抽屉面板",
  minLength: 1,
  errorMessage: {
    required: "标题最少1个字符",
    minLength: "标题最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "标题最少1个字符", trigger: "change" },
  ],
});

// 抽屉内容配置
const content = Type.String({
  code: "config-textarea",
  title: "抽屉内容",
  default: "抽屉面板内容描述...",
  minLength: 1,
  errorMessage: {
    required: "内容最少1个字符",
    minLength: "内容最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "内容最少1个字符", trigger: "change" },
  ],
});

// 抽屉弹出方向配置
const direction = Type.String({
  code: "config-dropdown",
  title: "弹出方向",
  default: "ltr",
  select: ["ltr", "rtl", "ttb", "btt"],
});

// 抽屉宽度/高度配置（横向方向用宽度，纵向方向用高度）
const size = Type.String({
  code: "config-input",
  title: "抽屉尺寸（宽/高）",
  default: "30%",
  placeholder: "横向方向填宽度，纵向方向填高度（如 30%、300px）",
  minLength: 1,
  errorMessage: {
    required: "尺寸最少1个字符",
    minLength: "尺寸最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "尺寸最少1个字符", trigger: "change" },
  ],
});

// 抽屉遮罩层配置
const withMask = Type.Boolean({
  code: "config-select",
  title: "是否显示遮罩",
  default: true,
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

// 卡片高度配置
const height = Type.String({
  code: "config-input",
  title: "卡片高度",
  default: "295px",
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

// 整体 Schema（支持多端配置）
const schema = Type.Object({
  visible: schemaAllViewport(visible),
  title: schemaAllViewport(title),
  content: schemaAllViewport(content),
  direction: schemaAllViewport(direction),
  size: schemaAllViewport(size),
  withMask: schemaAllViewport(withMask),
  height: schemaAllViewport(height),
  width: schemaAllViewport(width),
});

export type MoDrawerSchema = Static<typeof schema>;
export default schema;
