import Type, { type Static } from "typebox";
import { schemaAllViewport } from "@/utils/components";

const display = Type.Boolean({
  code: "config-viewport",
  title: "屏幕",
  default: true,
  errorMessage: {
    required: "选择一项即可",
  },
  rules: [{ required: true, message: "选择一项即可", trigger: "change" }],
});

const posterUrl = Type.String({
  code: "config-files",
  title: "封面图",
  default: "",
});

const autoPlay = Type.Boolean({
  code: "config-select",
  title: "自动播放",
  default: false,
});

const width = Type.String({
  code: "config-input",
  title: "宽度",
  default: "300px",
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
  default: "200px",
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

const videoUrl = Type.String({
  code: "config-input",
  title: "链接",
  default: "",
  placeholder: "请输入链接",
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
  posterUrl: schemaAllViewport(posterUrl),
  autoPlay: schemaAllViewport(autoPlay),
  videoUrl: schemaAllViewport(videoUrl),
});

export type MoVideoSchema = Static<typeof schema>;
export default schema;
