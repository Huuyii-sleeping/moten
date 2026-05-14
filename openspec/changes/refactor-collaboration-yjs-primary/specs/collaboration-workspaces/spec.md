## ADDED Requirements

### Requirement: Authenticated users SHALL enter a persistent personal collaboration workspace by default
系统 SHALL 在已登录用户进入页面编辑页时，自动连接该用户在该页面上的个人持久协同房间。若该个人房间首次不存在，系统 MUST 使用页面数据库当前保存内容初始化 Yjs 文档；若个人房间已存在，系统 MUST 恢复其持久化状态。

#### Scenario: First entry seeds a personal workspace from page data
- **WHEN** 已登录用户首次进入某个页面的编辑页，且其个人协同房间尚不存在
- **THEN** 系统 MUST 使用该页面数据库当前保存内容初始化个人 Yjs 文档并自动进入该房间

#### Scenario: Returning user resumes the same personal workspace
- **WHEN** 同一已登录用户再次进入同一页面的编辑页
- **THEN** 系统 MUST 自动恢复到该用户在该页面上的个人持久协同房间状态，而不是重新创建空白房间

### Requirement: System SHALL support persistent shared collaboration workspaces per page and room name
系统 SHALL 支持已登录用户基于页面和手动输入的房间名创建或加入共享持久协同房间。共享房间首次创建时，系统 MUST 使用创建者当前个人房间内容初始化；用户退出共享房间后，系统 MUST 自动切回该用户的个人房间。

#### Scenario: Creator seeds a shared workspace from the current personal workspace
- **WHEN** 已登录用户在某页面中输入一个尚不存在的共享房间名并创建共享房间
- **THEN** 系统 MUST 使用该用户当前个人房间的内容初始化该共享房间，并将用户连接到该共享房间

#### Scenario: User joins an existing shared workspace
- **WHEN** 已登录用户在某页面中输入一个已存在的共享房间名
- **THEN** 系统 MUST 连接到该共享房间并恢复其持久化状态

#### Scenario: User exits a shared workspace
- **WHEN** 已登录用户主动退出当前共享房间
- **THEN** 系统 MUST 自动重新连接到该用户在该页面上的个人持久协同房间

### Requirement: Core Yjs workspace state MUST cover block config, page config, and online presence in phase one
第一轮中，系统 MUST 使用 Yjs 统一维护块配置、页面配置和在线人数状态。系统 MUST 不再依赖旧 WebSocket 协同主线提供这些核心协同能力。

#### Scenario: Block and page changes propagate through Yjs
- **WHEN** 用户在个人房间或共享房间中修改块配置或页面配置
- **THEN** 系统 MUST 通过对应的 Yjs 文档同步这些变更，并在其他连接中反映同一状态

#### Scenario: Online presence is visible for the active workspace
- **WHEN** 用户成功连接到个人房间或共享房间
- **THEN** 系统 MUST 展示当前工作区的在线人数状态

### Requirement: Publish MUST be restricted to personal workspaces
系统 MUST 只允许用户在个人房间中发布页面；共享房间 MUST 禁止直接发布。个人房间发布时，系统 MUST 将当前 Yjs 文档中的块配置和页面配置回写页面数据库作为正式内容。

#### Scenario: Publish succeeds from a personal workspace
- **WHEN** 已登录用户位于个人房间并执行发布
- **THEN** 系统 MUST 使用当前个人房间的 Yjs 状态生成页面正式内容并写回页面数据库

#### Scenario: Publish is unavailable in a shared workspace
- **WHEN** 已登录用户位于共享房间
- **THEN** 系统 MUST 隐藏或禁用发布入口，并阻止共享房间状态直接写回页面数据库

### Requirement: Unsupported collaboration features MUST be hidden or disabled in phase one
第一轮中，系统 MUST 隐藏或禁用依赖旧协同主线的评论、历史、画布协同和依赖协同房间数据的导出能力，直到这些能力完成 Yjs 化迁移。

#### Scenario: Unsupported collaboration UI is not exposed
- **WHEN** 用户进入 Yjs 协同工作区
- **THEN** 系统 MUST 不暴露评论、历史、画布协同和依赖协同房间状态的导出入口，或将其明确禁用
