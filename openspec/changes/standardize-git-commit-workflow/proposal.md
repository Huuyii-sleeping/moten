## Why

当前仓库虽然已经引入了 `commitizen` 和 `cz-customizable`，但提交流程仍然不完整：缺少统一入口、缺少 `commit-msg` 校验、缺少默认提交模板，现有 `cz` 脚本还会自动 `git add .`，容易把无关改动一起提交。现在需要把“可选规范”收口成“默认执行的规范”。

## What Changes

- 为仓库补齐可执行的 Git 提交工作流，包括提交模板、提交入口和 `commit-msg` 校验。
- 统一 Conventional Commits 允许的 `type` 集合，并调整 `cz-customizable` 配置，使之和仓库规则一致。
- 新增独立的提交消息校验脚本，由 Husky `commit-msg` 钩子调用。
- 新增仓库级 `.gitmessage.txt` 模板和对应的初始化命令。
- 移除现有 `cz` 脚本中自动暂存全部变更的行为，避免误提交。

## Capabilities

### New Capabilities

- `git-commit-workflow`: 规范仓库的提交入口、消息模板、消息校验和开发者使用方式。

### Modified Capabilities

- None.

## Impact

- 影响根目录 Git 提交相关配置文件、Husky 钩子、`package.json` scripts、提交校验脚本和 Commitizen 配置。
- 不影响运行时代码和业务接口。
