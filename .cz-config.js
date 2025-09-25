// .cz-config.js
module.exports = {
  types: [
    { value: "feat", name: "feat:     🚀 新功能" },
    { value: "fix", name: "fix:      🐞 修复 bug" },
    { value: "docs", name: "docs:     📚 文档变更" },
    { value: "style", name: "style:    💄 代码格式调整（不影响逻辑）" },
    {
      value: "refactor",
      name: "refactor: ♻️ 重构（既不修复 bug 也不增加功能）",
    },
    { value: "perf", name: "perf:     ⚡ 性能优化" },
    { value: "test", name: "test:     ✅ 添加或修改测试" },
    { value: "build", name: "build:    📦 构建系统或外部依赖变更" },
    { value: "ci", name: "ci:       🎡 CI 配置或脚本变更" },
    { value: "chore", name: "chore:    🔧 日常维护（如更新依赖）" },
    { value: "revert", name: "revert:  🔁 回滚提交" },
    { value: "wip", name: "wip:      🚧 工作进行中（WIP）" },
  ],

  scopes: [
    { name: "components" },
    { name: "hooks" },
    { name: "utils" },
    { name: "api" },
    { name: "assets" },
    { name: "styles" },
    { name: "deps" },
    { name: "ci" },
    { name: "other" },
    // 你可以根据项目自定义 scope
  ],

  // 是否允许自定义 scope
  allowCustomScopes: true,
  // 是否允许中断变更（BREAKING CHANGE）
  allowBreakingChanges: ["feat", "fix", "refactor", "perf"],
  // 跳过任何问题（这里不跳过）
  skipQuestions: [],

  // 中文提示
  messages: {
    type: "请选择提交类型:",
    scope: "请选择影响范围（可选）:",
    customScope: "请输入自定义范围:",
    subject: "请简要描述变更（英文句首大写，结尾不加句号）:",
    body: "请输入详细描述（可选）:",
    breaking: "列出所有 BREAKING CHANGE（可选）:",
    footer: "请输入关联的 issue（如: #123, 可选）:",
    confirmCommit: "确认提交？",
  },

  // 主题（可选）
  theme: {
    icon: "🔍",
    commit: "✅",
    list: "📌",
    confirm: "❓",
  },
};
