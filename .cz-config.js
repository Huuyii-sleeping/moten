module.exports = {
  types: [
    { value: "feat", name: "feat:     新功能" },
    { value: "fix", name: "fix:      修复问题" },
    { value: "docs", name: "docs:     文档变更" },
    { value: "style", name: "style:    代码风格调整（不影响逻辑）" },
    { value: "refactor", name: "refactor: 重构（既不修复 bug 也不增加功能）" },
    { value: "perf", name: "perf:     性能优化" },
    { value: "test", name: "test:     测试相关变更" },
    { value: "build", name: "build:    构建系统或外部依赖变更" },
    { value: "ci", name: "ci:       CI 配置或脚本变更" },
    { value: "chore", name: "chore:    日常维护" },
    { value: "revert", name: "revert:   回滚提交" },
  ],

  scopes: [
    { name: "repo" },
    { name: "editor" },
    { name: "ui" },
    { name: "playground" },
    { name: "server" },
    { name: "collab" },
    { name: "docs" },
    { name: "build" },
    { name: "git" },
    { name: "openspec" },
    { name: "other" },
  ],

  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix", "refactor", "perf"],
  skipQuestions: [],

  messages: {
    type: "请选择提交类型:",
    scope: "请选择影响范围（可选）:",
    customScope: "请输入自定义范围:",
    subject: "请输入简要描述（祈使语气，简洁明确）:",
    body: "请输入详细描述（可选）:",
    breaking: "列出 BREAKING CHANGE（可选）:",
    footer: "请输入关联的 issue，例如 #123（可选）:",
    confirmCommit: "确认提交？",
  },
};
