## 1. Yjs 服务端主线化

- [x] 1.1 修正并增强 `packages/moten-server/services/y-collab/collab-basic-service.js`，使其能稳定处理房间连接、加载、保存和在线状态广播
- [x] 1.2 为个人房间和共享房间实现初始化种子逻辑，并补齐从页面数据库或个人房间快照创建 Yjs 文档的流程
- [x] 1.3 将 `packages/moten-server/index.js` 的协同入口切换到 Yjs 服务，并保留旧服务仅作为回退参考

## 2. 前端房间模型与核心同步

- [ ] 2.1 以现有 `packages/moten-editor/src/stores/collaborationStore.ts` 为统一入口，替换为 Yjs 主实现并兼容当前业务调用路径
- [ ] 2.2 重写 `packages/moten-editor/src/stores/roomStore.ts` 和协同弹窗/页头交互，实现自动进入个人房间、手动切换共享房间、退出共享房间自动回个人房间
- [ ] 2.3 调整 `packages/moten-editor/src/stores/edit.ts` 的协同同步逻辑，使块配置、页面配置和在线状态都经由 Yjs 主线工作

## 3. 第一轮 UI 收口与发布约束

- [ ] 3.1 隐藏或禁用评论、历史、画布协同和依赖协同房间状态的导出入口，避免继续暴露未迁移能力
- [ ] 3.2 将发布流程限制在个人房间，并在发布时把当前个人房间的 Yjs 状态回写页面数据库
- [ ] 3.3 验证个人房间自动进入、共享房间种子初始化、退出共享房间回退个人房间以及共享房间禁发版行为
