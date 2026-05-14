# AGENT 执行规则

本文档是当前工作区唯一规则源。后续统一维护本文档，不再单独维护其他同类规则文档。

## 1. 语言规则

- 与用户沟通默认使用中文（简体）。
- 仅在以下场景使用英文：
  - 用户明确要求英文；
  - 代码标识符、命令、路径、日志、报错原文；
  - 第三方接口字段必须保持英文。
- 新增或修改文档时优先中文，必要时补充英文术语原词。

## 2. 编码与文本

- 所有文本文件使用 UTF-8 编码。
- 避免乱码；如修复历史乱码，保持语义不变，并在变更说明中注明。
- 非必要不混用全角和半角标点。

## 3. 默认任务流程

中等及以上复杂度任务，默认走：

1. `Superpowers` 做澄清、规划、执行约束；
2. `OpenSpec` 记录变更提案、设计、任务、规格；
3. 代码实现严格对齐 `OpenSpec tasks`；
4. 完成后做验证、评审、归档。

不要跳过规划直接改代码，不要跳过验证直接宣布完成。

## 4. OpenSpec 规则

### 4.1 初始化状态

当前仓库已经初始化 `OpenSpec`：

- [openspec/config.yaml](openspec/config.yaml)
- [openspec/changes](openspec/changes)
- [openspec/specs](openspec/specs)

仓库内还包含 OpenSpec 为 Codex 生成的本地 skills：

- `.codex/skills/openspec-propose`
- `.codex/skills/openspec-apply-change`
- `.codex/skills/openspec-archive-change`
- `.codex/skills/openspec-explore`

### 4.2 默认流程

按 OpenSpec 流程推进：

1. `new change`
2. `artifacts`
3. `implement`
4. `validate`
5. `archive`

每个中大型任务都应有独立 change，不要把多个不相关目标塞进同一个 change。

### 4.3 Change 命名

统一使用 kebab-case，例如：

- `refactor-collaboration-layer`
- `refactor-editor-state-boundary`
- `fix-playground-style-import`

### 4.4 Artifacts 规则

每个 change 至少维护：

- `proposal.md`
- `design.md`
- `tasks.md`

如果需求改变系统行为、接口契约或关键能力，再补对应 `specs/.../spec.md` delta。

要求：

- `proposal.md` 写清目标、动机、非目标；
- `design.md` 写清拆分边界、迁移路径、兼容策略；
- `tasks.md` 拆成可独立验证的小任务；
- 每个任务都要明确映射到文件和验证命令。

### 4.5 常用命令

```powershell
openspec.cmd status
openspec.cmd new change "<name>"
openspec.cmd status --change "<name>"
openspec.cmd instructions apply --change "<name>" --json
openspec.cmd validate "<name>" --type change
```

## 5. Superpowers 规则

Superpowers 已安装到 `~/.codex/skills`。使用前需要至少重启一次 Codex，让新增 skills 被原生加载。

默认匹配方式：

- 新功能、较大重构、方案不清晰：
  - `using-superpowers`
  - `brainstorming`
- 需求明确但任务较大：
  - `using-superpowers`
  - `writing-plans`
- Bug、测试失败、异常行为：
  - `using-superpowers`
  - `systematic-debugging`
- 正式实现：
  - `executing-plans`
  - `test-driven-development`
- 声称完成前：
  - `verification-before-completion`
- 大任务完成或提交前：
  - `requesting-code-review`

## 6. 执行与打断规则

- 遇见简单问题，默认直接执行，不为确认细节而额外打断用户。
- 对于没有安全风险、不会造成破坏、不会引入高成本副作用的操作，默认直接执行，不中途征求许可。
- 对于边界收口、模块拆分、OpenSpec 归档这类连续架构收口操作，应自行阅读源码与文档、选择下一步并执行到本地提交，不要停下来让用户决定下一块做什么。
- 仅在以下情况打断用户：
  - 涉及破坏性操作；
  - 可能导致数据丢失；
  - 需要用户提供缺失信息；
  - 明显存在安全、权限、资金或外部系统风险。

## 7. 代码变更原则

- 单文件单职责，保持模块边界清晰。
- 工具层保持薄适配，业务逻辑放在独立模块。
- 不做与当前任务无关的重构或格式化噪音改动。
- 不使用破坏性 Git 命令，例如 `reset --hard`，除非被明确要求。

### 7.1 通用编码思想钢印

- 失败要尽早、明确、可见。除非需求明确要求，否则不要为了看起来更稳而补兜底逻辑。
- 异常与错误默认尽早上抛，不要在业务层内部吞错、改写或静默处理。
- 测试必须能证明问题真实存在。优先写先失败、后修复、再通过的测试；一开始就通过、无法证明问题存在的测试价值很低。
- 对外暴露的类型、接口、函数、类必须补充注释；关键逻辑分支应补充说明其功能意图的注释。
- 能复用已有公共工具函数时，优先复用；若发现可沉淀的公共逻辑，应先抽到公共工具层再复用，避免同类逻辑分散复制。
- 类型应始终复用其所属库或模块的源类型；不要为了绕过 TypeScript 问题而在本地重复定义近似类型，也不要随意把值强转成临时占位类型。
- 避免没有实际收益的抽象层；如果某层封装既没有简化代码，也没有守住真实边界，就应优先直接调用所属模块或服务，而不是在层间传递宽泛包装对象。
- 除非 TypeScript 不能正确推断，或为了维持公开契约必须显式声明，否则不要随手给函数补显式返回类型。
- 不要为了看起来更整洁就抽取一次性辅助函数；只有在它能保留真实边界、隐藏有意义复杂度，或预期会被复用时才抽取。单次、简单逻辑优先内联。

## 8. 当前仓库的工作流落地

### 8.1 Intake

每次开始正式任务时，建议按以下顺序开局：

1. 读取相关审计文档或需求文档；
2. 选择对应 Superpowers 工作模式；
3. 创建或进入对应 OpenSpec change；
4. 校对 `proposal/design/tasks`；
5. 写或更新 `docs/superpowers/plans/...`；
6. 再开始实际改代码。

### 8.2 Planning

当提案和设计稳定后，使用 `writing-plans` 补一份可执行计划。

计划文件统一放在：

- `docs/superpowers/plans/YYYY-MM-DD--<topic>.md`

计划必须包含：

- 目标范围；
- 文件边界；
- 任务顺序；
- 风险点；
- 验证命令；
- 回退思路。

`OpenSpec tasks.md` 是变更状态来源，`docs/superpowers/plans/...` 是实现作战手册。两者要保持一致，不允许分叉。

### 8.3 Execution

正式实现时：

- 优先围绕 `tasks.md` 执行，而不是自由发挥；
- 一次只做一个 task；
- 做完立刻把 `tasks.md` 对应项从 `- [ ]` 改成 `- [x]`；
- 如果实现中发现设计不成立，先回写 `design.md` 或 `proposal.md`；
- 如果出现三次以上无效修复尝试，切回 `systematic-debugging`。

### 8.4 Review

完成一个较大的 task、一个 change 的主体实现，或者准备提交前，必须做评审。

评审重点：

- 行为回归；
- 边界条件；
- 状态同步；
- 类型与接口一致性；
- 无用重复逻辑是否真的被删除。

### 8.5 Recommended Mapping

结合当前仓库已有审计，建议按下面顺序开 change：

1. 协同模块收敛
   - [docs/refactor-audit/01-collaboration-consolidation.md](docs/refactor-audit/01-collaboration-consolidation.md)
2. Editor 状态与副作用拆分
   - [docs/refactor-audit/02-editor-state-and-side-effects.md](docs/refactor-audit/02-editor-state-and-side-effects.md)
3. 评论与 Mention 面板统一
   - [docs/refactor-audit/03-comment-and-mention-ui-duplication.md](docs/refactor-audit/03-comment-and-mention-ui-duplication.md)
4. 发布/导出流程收敛
   - [docs/refactor-audit/04-page-publish-export-flow.md](docs/refactor-audit/04-page-publish-export-flow.md)
5. 配置面板 renderer 统一
   - [docs/refactor-audit/05-config-panel-renderer-unification.md](docs/refactor-audit/05-config-panel-renderer-unification.md)
6. 后端 CRUD 抽象
   - [docs/refactor-audit/06-backend-crud-abstraction.md](docs/refactor-audit/06-backend-crud-abstraction.md)
7. 插件系统边界加固
   - [docs/refactor-audit/07-plugin-system-hardening.md](docs/refactor-audit/07-plugin-system-hardening.md)
8. 构建与 workspace 一致性
   - [docs/refactor-audit/08-build-output-and-workspace-consistency.md](docs/refactor-audit/08-build-output-and-workspace-consistency.md)
9. 命名、存储 key、接口契约统一
   - [docs/refactor-audit/09-naming-storage-and-contract-normalization.md](docs/refactor-audit/09-naming-storage-and-contract-normalization.md)

建议一个审计点对应一个 OpenSpec change，不要合并。

## 9. 完成后汇报要求

每次任务完成后必须给出改动点总结，至少包含：

- 修改了哪些文件；
- 每个文件改了什么；
- 核心实现逻辑；
- 验证方式（命令与结果）。

## 10. 包管理器规则

- 统一使用 `pnpm`，不再新增 `npm` 工作流约定。
- 新增文档、脚本、命令示例时，优先写 `pnpm` 命令。

## 11. 清理规则

- 每次测试产生的运行产物、临时数据和缓存内容，在本次开发结束后就删除，不留到下一轮。
- 每次提交或交接之前必须再次清理，并确认测试产物没有残留。
- 以下目录或文件默认视为运行、测试或构建产物，不纳入 commit：
  - `.pnpm-store/`
  - `node_modules/`
  - `packages/**/node_modules/`
  - `packages/**/dist/`
  - `coverage/`
  - `.vite/`
  - `.cache/`
  - `.temp/`
  - `tmp/`
  - 临时导出 zip、临时截图、临时日志

## 12. 提交内容规则

- 允许提交：
  - 源码变更；
  - 必要文档变更；
  - 必要的 `openspec/` 变更；
  - 必要的仓库级配置变更。
- 禁止提交：
  - 临时脚本；
  - 本地快照；
  - 持久化运行数据；
  - 临时测试产物。
- 每次完成任务后只执行到本地 `git commit`，不要执行 `git push`。
- 最后的远端推送由用户手动执行；如需提醒，只在最终汇报中说明当前提交 hash 和分支状态。

## 13. Commit Message 规范

格式：

`<type>(<scope>): <subject>`

示例：

- `feat(api): add user profile endpoint`
- `fix(editor): prevent duplicate comment fetch`
- `docs(agent): unify repository workflow`
- `refactor(collab): consolidate websocket message flow`

允许的 `type`：

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

规则：

- `scope` 可选，但建议填写。
- `subject` 使用祈使语气，简洁明确。
- `type` 和 `scope` 继续遵循 Conventional Commits 约定使用英文；`subject` 默认使用中文，只有在引用固定英文标识、命令、路径、接口字段或无法自然翻译的外部术语时才保留英文。
- 破坏性变更使用 `!`，例如：`feat(api)!: remove v1 endpoint`。

当前仓库已经提供 `.husky/commit-msg` 和 `.gitmessage.txt` 模板；后续如调整提交规则，必须同步更新校验脚本、模板和本文档，保持三者一致。

## 14. 验证规则

每次实现至少执行：

1. 对当前变更范围可用的构建命令；
2. 对应 change 的 smoke、回归或手动验收；
3. `openspec.cmd status --change "<name>" --json`
4. `openspec.cmd validate "<name>" --type change`

由于当前仓库根目录没有统一的 `pnpm build` 脚本，使用等价包级命令代替。常用命令如下：

```powershell
pnpm.cmd -F @moten/ui build
pnpm.cmd -F @moten/editor type-check
pnpm.cmd -F @moten/editor build
pnpm.cmd -F @moten/playground-vue3 build
```

注意：

- 当前已知基线里，`@moten/playground-vue3` 因样式导入路径问题可能失败；
- 如果本次变更没有涉及 playground，可记录为既有基线问题；
- 如果本次变更涉及 workspace 导出、样式入口或 UI 产物，必须一并验证 playground。

## 15. 测试规则

- 测试文件应尽量集中管理，避免把测试和业务代码无边界混放。
- 新增单元测试时，优先镜像源代码目录结构，保证测试对象清晰。
- 不要在一个测试文件里跨多个不相干模块混测。
- 先写能证明问题存在的失败测试，再做修复，再验证通过。

## 16. 失败处理规则

- 先给出可读错误原因，再给出修复动作。
- 遇到沙箱限制可申请提权后重试。
- 遇到设计失效、需求冲突或实现路径被证伪时，优先回写 OpenSpec artifacts，而不是硬继续。

## 17. 禁止事项

- 不要在没有 `proposal/design/tasks` 的情况下直接进行大重构。
- 不要把多个不相关重构目标塞进同一个 change。
- 不要在任务未勾选完成时口头宣布完成。
- 不要绕过验证命令只凭感觉判断“应该没问题”。
- 不要在发现设计失效后继续硬写代码，先回写 artifacts。

## 18. 优先级

- 若与系统或平台更高优先级指令冲突，以更高优先级为准。
