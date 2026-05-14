import fs from "node:fs";

/**
 * 允许的 Conventional Commits type 集合。
 * 该集合需要与仓库 AGENT 规则和 .cz-config.js 保持一致。
 */
const ALLOWED_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

const conventionalHeaderPattern = new RegExp(
  `^(?:${ALLOWED_TYPES.join("|")})(?:\\([a-z0-9][a-z0-9./_-]*\\))?(?:!)?: .+$`,
);

const allowedGeneratedPatterns = [
  /^Merge\b/,
  /^fixup!\s.+$/,
  /^squash!\s.+$/,
  /^Revert\s".+"$/,
];

/**
 * 校验提交消息首行是否符合仓库规则。
 * @param {string} header 提交消息首行
 */
function isValidHeader(header) {
  return (
    conventionalHeaderPattern.test(header) ||
    allowedGeneratedPatterns.some((pattern) => pattern.test(header))
  );
}

/**
 * 读取提交消息首行。
 * @param {string} commitMsgFile Git 传入的 commit message 文件路径
 */
function readHeader(commitMsgFile) {
  const content = fs.readFileSync(commitMsgFile, "utf8");
  return content.split(/\r?\n/, 1)[0]?.trim() ?? "";
}

function printError(header) {
  console.error("提交消息格式不符合仓库规范。");
  console.error(`当前首行: ${header || "<empty>"}`);
  console.error("");
  console.error("允许格式:");
  console.error("  <type>(<scope>): <subject>");
  console.error("");
  console.error("允许的 type:");
  console.error(`  ${ALLOWED_TYPES.join(" | ")}`);
  console.error("");
  console.error("示例:");
  console.error("  feat(editor): add block schema validator");
  console.error("  fix(collab): prevent duplicate remote patch apply");
  console.error("  docs(agent): unify repository workflow");
  console.error("");
  console.error("允许通过的 Git 自动消息:");
  console.error("  Merge ...");
  console.error("  fixup! ...");
  console.error('  Revert "..."');
}

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error("缺少 commit message 文件路径参数。");
  process.exit(1);
}

const header = readHeader(commitMsgFile);

if (!isValidHeader(header)) {
  printError(header);
  process.exit(1);
}
