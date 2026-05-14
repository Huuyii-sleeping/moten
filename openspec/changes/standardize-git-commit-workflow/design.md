## Context

当前仓库已有这些基础：

- 根 `package.json` 中已经包含 `commitizen`、`cz-customizable`、`husky`
- `.husky/pre-commit` 存在但为空
- `.cz-config.js` 已存在，但类型集合与当前仓库规则不完全一致，并且中文提示存在乱码
- 没有 `.gitmessage.txt`
- 没有 `commit-msg` 校验钩子

目标不是引入新的提交系统，而是在现有 `commitizen + husky` 基础上完成收口。

## Goals / Non-Goals

**Goals:**

- 提供统一、低摩擦的提交入口；
- 强制校验提交首行符合仓库允许的 Conventional Commits 规则；
- 允许少量 Git 自动生成提交信息通过，例如 merge；
- 给开发者一个默认提交模板，减少记忆成本；
- 让仓库内文档、脚本和规则三者一致。

**Non-Goals:**

- 不引入新的外部依赖；
- 不修改业务代码；
- 不强制接管 `pre-commit` 的 lint 或测试流程；
- 不把所有 Git 流程都自动化成 CLI 工具。

## Decisions

### 1. 使用 Node 脚本做 commit message 校验，而不是纯 shell 正则

原因：

- 更容易在 Windows 环境下稳定执行；
- 校验逻辑可测试、可维护；
- 错误提示可以更具体。

备选方案：

- 纯 shell `grep`/正则：实现更短，但跨平台和可维护性较差。

### 2. 保留 `commitizen`，但移除自动 `git add .`

原因：

- 现有 `cz` 脚本会自动暂存所有变更，这不符合“只提交当前任务相关改动”的约束；
- `commitizen` 仍适合作为交互式提交入口；
- 暂存行为应由开发者显式控制。

备选方案：

- 完全移除 `commitizen`：会降低交互式提交体验；
- 保留自动 `git add .`：风险过高。

### 3. 使用“灵活规范化”校验策略

原因：

- 默认要求 Conventional Commits；
- 同时允许必要的 Git 自动消息，例如 `Merge ...`；
- 这样既保证规范，又不阻断正常 Git 操作。

备选方案：

- 完全严格只允许 Conventional Commits：会阻断 merge 等标准 Git 流程。

### 4. 提交模板只提供提示，不替代校验

原因：

- 模板降低记忆负担；
- 真实约束仍应由 `commit-msg` 钩子执行；
- 模板和校验职责清晰分离。

## Risks / Trade-offs

- [风险] 开发者本地未执行模板配置命令 → 缓解：提供 `pnpm commit:setup` 命令，并在模板文件中保留说明。
- [风险] 校验过于严格导致正常 Git 操作失败 → 缓解：允许 merge 等 Git 自动消息通过。
- [风险] `cz-customizable` 提示与仓库规则再次漂移 → 缓解：统一从 `AGENT.md` 的允许类型集合收口到 `.cz-config.js`。

