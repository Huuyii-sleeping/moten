import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const itemType = Type.Object({
  content: Type.String(),
  disabled: Type.Boolean(),
});

const items = Type.Array(itemType, {
  code: "config-list",
  title: "内容列表",
  default: [
    {
      content: "test1",
      disabled: false,
    },
    {
      content: "test2",
      disabled: false,
    },
    {
      content: "test3",
      disabled: true,
    },
  ],
  errorMessage: {
    required: "内容列表不能为空",
  },
});

const title = Type.String({
  code: "config-input",
  title: "标题",
  default: "dropdown",
});

const schema = Type.Object({
  title: schemaAllViewport(title),

  items: schemaAllViewport(items),
});

export type MoElDropdownSchema = Static<typeof schema>;

export default schema;
