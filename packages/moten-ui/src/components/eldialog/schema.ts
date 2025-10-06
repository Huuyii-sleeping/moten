import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const mount = Type.String({
  code: "config-input",
  title: "挂载组件",
  default: "el-button",
});

const mountContent = Type.String({
  code: "config-input",
  title: "配置内容",
  default: "Click to open the Dialog",
});

const title = Type.String({
  code: "config-input",
  title: "标题",
  default: "dialog",
});

const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "500px",
});

const content = Type.String({
  code: "config-input",
  title: "内容",
  default: "",
  placeholder: "请输入内容",
});

const confirmText = Type.String({
  code: "config-input",
  title: "确认内容",
  default: "Confirm",
});

const cancelText = Type.String({
  code: "config-input",
  title: "取消内容",
  default: "Cancel",
});
const schema = Type.Object({
  mount: schemaAllViewport(mount),
  title: schemaAllViewport(title),
  width: schemaAllViewport(width),
  content: schemaAllViewport(content),
  confirmText: schemaAllViewport(confirmText),
  cancelText: schemaAllViewport(cancelText),
  mountContent: schemaAllViewport(mountContent)
});

export type MoElDropdownSchema = Static<typeof schema>;

export default schema;
