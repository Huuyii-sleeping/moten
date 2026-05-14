## ADDED Requirements

### Requirement: Repository SHALL provide a standardized commit entry workflow
仓库 SHALL 提供统一的提交入口，使开发者可以使用受控的命令和模板完成提交，而不是依赖手写自由格式消息。

#### Scenario: Developer uses the guided commit command
- **WHEN** 开发者在仓库根目录执行约定的提交命令
- **THEN** 系统 SHALL 启动交互式提交流程，并使用仓库允许的 `type` 集合和 scope 选项

### Requirement: Repository MUST validate commit messages before commit completes
仓库 MUST 在 `commit-msg` 阶段校验提交首行，默认要求符合 Conventional Commits 规则，并允许少量 Git 自动生成提交信息通过。

#### Scenario: Conventional Commit message passes validation
- **WHEN** 提交首行为合法的 Conventional Commit，例如 `fix(editor): prevent duplicate comment fetch`
- **THEN** 校验 SHALL 通过，提交继续执行

#### Scenario: Git-generated merge message passes validation
- **WHEN** 提交首行为 Git 自动生成的 merge 消息，例如 `Merge branch 'feature-x'`
- **THEN** 校验 SHALL 通过，提交继续执行

#### Scenario: Invalid message fails validation
- **WHEN** 提交首行不符合 Conventional Commits 且也不属于允许的 Git 自动消息
- **THEN** 校验 MUST 阻止提交，并输出可读的修复提示和示例

### Requirement: Repository SHALL provide a default commit message template
仓库 SHALL 提供默认提交模板，用于提示开发者填写符合仓库规则的提交信息格式。

#### Scenario: Developer configures the repository template
- **WHEN** 开发者执行仓库提供的模板初始化命令
- **THEN** Git SHALL 使用仓库内的提交模板文件作为默认提交信息模板
