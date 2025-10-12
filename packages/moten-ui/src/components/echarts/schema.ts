import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

// 图表标题配置
const title = Type.String({
  code: "config-input",
  title: "图表标题",
  default: "数据图表",
  minLength: 0,
  placeholder: "可不填",
  errorMessage: {
    minLength: "标题可空或至少1个字符",
  },
});

// 图表类型配置
const chartType = Type.String({
  code: "config-dropdown",
  title: "图表类型",
  default: "line",
  select: ["line", "bar", "pie", "column"],
  errorMessage: {
    required: "请选择图表类型",
  },
  rules: [{ required: true, message: "请选择图表类型", trigger: "change" }],
});

// 图表数据配置（JSON格式）
const chartData = Type.String({
  code: "config-textarea",
  title: "图表数据（JSON）",
  default:
    '{"xAxis": ["周一", "周二", "周三", "周四", "周五"], "series": [120, 200, 150, 80, 70]}',
  minLength: 1,
  errorMessage: {
    required: "请输入图表数据",
    minLength: "数据不能为空",
  },
  rules: [{ required: true, message: "请输入图表数据", trigger: "change" }],
});

// 图表宽度配置
const width = Type.String({
  code: "config-input",
  title: "图表宽度",
  default: "100%",
  placeholder: "如 600px、100%",
  minLength: 1,
  errorMessage: {
    required: "宽度最少1个字符",
    minLength: "宽度最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "宽度最少1个字符", trigger: "change" },
  ],
});

// 图表高度配置
const height = Type.String({
  code: "config-input",
  title: "图表高度",
  default: "400px",
  placeholder: "如 400px",
  minLength: 1,
  errorMessage: {
    required: "高度最少1个字符",
    minLength: "高度最少1个字符",
  },
  rules: [
    { required: true, min: 1, message: "高度最少1个字符", trigger: "change" },
  ],
});

// 是否显示配置
const display = Type.Boolean({
  code: "config-viewport",
  title: "是否显示",
  default: true,
  errorMessage: {
    required: "请选择是否显示",
  },
  rules: [{ required: true, message: "请选择是否显示", trigger: "change" }],
});

// 整体Schema定义
const schema = Type.Object({
  display: schemaAllViewport(display),
  title: schemaAllViewport(title),
  chartType: schemaAllViewport(chartType),
  chartData: schemaAllViewport(chartData),
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
});

export type MoEChartsSchema = Static<typeof schema>;
export default schema;
