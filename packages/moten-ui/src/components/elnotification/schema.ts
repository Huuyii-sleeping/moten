import { schemaAllViewport } from "@/utils/components";
import Type, { type Static } from "typebox";

const defaultMount = "el-button";
const title = Type.String({
  code: "config-input",
  default: "Title",
  title: "标题",
});

const message = Type.String({
  code: "config-input",
  default: "this is a message",
  title: "标题",
});

const duration = Type.Number({
  code: "cofig-input",
  default: 2000,
  title: "持续时间",
});

const position = Type.String({
  code: "config-dropdown",
  title: '出现位置',
  default: "top-right",
  select: ["top-right", "top-left", "bottom-left", "bottom-right"],
});

const mount = Type.String({
  code: "config-input",
  default: defaultMount,
  title: "挂载组件",
});

const mountContent = Type.String({
    code: 'config-input',
    default: 'Notification',
    title: '挂载内容'
})

const schema = Type.Object({
  title: schemaAllViewport(title),
  message: schemaAllViewport(message),
  duration: schemaAllViewport(duration),
  mount: schemaAllViewport(mount),
  position: schemaAllViewport(position),
  mountContent: schemaAllViewport(mountContent),
});

export type MoElMenuSchema = Static<typeof schema>;

export default schema;
