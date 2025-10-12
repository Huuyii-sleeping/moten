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

// const TableColumn = Type.Object({
//   prop: Type.String({
//     description: "表格列绑定的字段名",
//     title: "字段名",
//     default: "field",
//     rules: [{ required: true, message: "请输入字段名", trigger: "change" }],
//   }),
//   label: Type.String({
//     description: "表格列显示的标题",
//     title: "列标题",
//     default: "标题",
//     rules: [{ required: true, message: "请输入列标题", trigger: "change" }],
//   }),
//   width: Type.Optional(
//     Type.String({
//       description: '列宽度，如 "180" 或 "180px"',
//       title: "列宽度",
//       default: "180",
//       placeholder: "请输入宽度",
//     })
//   ),
// });

// const TableRow = Type.Object(
//   {
//     date: Type.String({ description: "日期字段", default: "2024-01-01" }),
//     name: Type.String({ description: "名称字段", default: "默认名称" }),
//     address: Type.String({ description: "地址字段", default: "默认地址" }),
//   },
//   {
//     additionalProperties: false,
//     description: "表格行数据结构",
//   }
// );

const tableConfig = Type.String({
  code: "config-table",
  title: "表格配置",
  default: {
    columns: [
      { prop: "date", label: "日期", width: "180" },
      { prop: "name", label: "名称", width: "180" },
      { prop: "address", label: "地址" },
    ],
    tableData: [
      { date: "2024-01-01", name: "测试1", address: "地址1" },
      { date: "2024-01-02", name: "测试2", address: "地址2" },
    ],
  },
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
  width: schemaAllViewport(width),
  height: schemaAllViewport(height),
  tableConfig: schemaAllViewport(tableConfig),
});

export type MoImageSchema = Static<typeof schema>;

export default schema;
