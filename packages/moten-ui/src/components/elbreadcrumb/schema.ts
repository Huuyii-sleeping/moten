import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const eltabsItem = Type.Object({
  content: String,
  to: String
});

const items = Type.Array(eltabsItem, {
  code: "config-list",
  title: "内容列表",
  default: [
    {
      content: "home",
      to: '/',
    },
    {
      content: "Config",
      to: '/edit'
    },
    {
      content: "Role",
      to: '/edit'
    }
  ],
});
const schema = Type.Object({
  items: schemaAllViewport(items),
});

export type MoEltabsSchema = Static<typeof schema>;

export default schema;
