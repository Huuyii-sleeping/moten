import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const eltabsItem = Type.Object({
  content: String,
  label: String,
  name: String,
});

const type = Type.String({
  code: "config-dropdown",
  title: "类型",
  default: "default",
  select: ["default", "card", "border-card"],
});
const editable = Type.String({
  code: "config-select",
  title: "是否可以添加删除",
  default: false,
});
const items = Type.Array(eltabsItem, {
  code: "config-list",
  title: "内容列表",
  default: [
    {
      content: "User",
      label: "User",
      name: "1",
      disable: false,
    },
    {
      content: "Config",
      label: "Config",
      name: "2",
      disabled: false,
    },
    {
      content: "Role",
      label: "Role",
      name: "3",
      disabled: true,
    },
    {
      content: "Task",
      label: "Task",
      name: "4",
      disabled: false,
    },
  ],
});
const schema = Type.Object({
  type: schemaAllViewport(type),
  editable: schemaAllViewport(editable),
  items: schemaAllViewport(items),
});

export type MoEltabsSchema = Static<typeof schema>;

export default schema;
