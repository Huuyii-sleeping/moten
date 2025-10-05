import { schemaAllViewport } from "@/utils/components";
import { Type, type Static } from "typebox";

const placeholder = Type.String({
  code: "config-input",
  title: "占位内容",
  default: "",
  placeholder: "Select date and time",
});

const size = Type.String({
  code: "config-dropdown",
  title: "尺寸",
  select: ["small", "default", "large"],
  default: "",
});

const title = Type.String({
  code: "config-input",
  title: "头标题",
  default: "",
});

const schema = Type.Object({
  placeholder: schemaAllViewport(placeholder),
  size: schemaAllViewport(size),
  title: schemaAllViewport(title),
});

export type MoBlockSchema = Static<typeof schema>;

export default schema;
