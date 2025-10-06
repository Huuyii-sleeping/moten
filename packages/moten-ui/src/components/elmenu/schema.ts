import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const subMenuItem = Type.Object({
  content: Type.String(),
  disabled: Type.Boolean(),
});

const menuItem = Type.Object({
  content: Type.String(),
  disabled: Type.Boolean(),
  children: Type.Optional(Type.Array(subMenuItem)),
});

const mode = Type.String({
  code: "config-dropdown",
  title: "展示模式",
  select: ["horizontal", "vertical"],
  default: "horizontal",
});
const collapse = Type.Boolean({
  code: "config-select",
  title: "是否折叠",
  default: false,
});
const items = Type.Array(menuItem, {
  title: "内容列表",
  code: "config-tree",
  default: [
    {
      content: "test1",
      disabled: false,
    },
    {
      content: "test2",
      disabled: false,
      children: [
        {
          content: "test2-1",
          disabled: false,
        },
        {
          content: "test2-2",
          disabled: true,
        },
      ],
    },
    {
      content: "test3",
      disabled: true,
    },
  ],
});

const schema = Type.Object({
  mode: schemaAllViewport(mode),
  collapse: schemaAllViewport(collapse),
  items: schemaAllViewport(items),
});

export type MoElMenuSchema = Static<typeof schema>;

export default schema;
