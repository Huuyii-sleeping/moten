# 01 协同模块收敛

## 现状

仓库里同时存在两套协同实现，而且前后端都各自分叉了一次。

- 前端 WebSocket 方案：`packages/moten-editor/src/stores/collaborationStore.ts`
- 前端 Yjs/CRDT 方案：`packages/moten-editor/src/stores/CRDT/collaborationStore.ts`
- 后端普通协同服务：`packages/moten-server/services/collab/collab-basic-service.js`
- 后端 Yjs 协同服务：`packages/moten-server/services/y-collab/collab-basic-service.js`

## 重复点

- 连接、断开、重连、在线用户、评论、画布同步、房间解散都重复实现了一遍。
- 两套前端 store 都维护连接状态、用户颜色、评论、历史、canvas 操作队列。
- 两套后端服务都维护文档、连接集合、用户进出广播和清理逻辑。

## 风险

- 任何协同需求变更都要同时改四处实现。
- 前后端消息类型可能逐步漂移，导致协议不可预测。
- 一部分页面调用的是旧实现，另一部分能力又依赖新实现，后续排错成本会越来越高。

## 直接证据

- `packages/moten-editor/src/stores/edit.ts` 直接绑定 `useCollaborationStore`
- `packages/moten-editor/src/stores/roomStore.ts` 也直接绑定 `useCollaborationStore`
- `packages/moten-editor/src/stores/CRDT/collaborationStore.ts` 已经具备另一整套连接和消息处理逻辑
- `packages/moten-server/index.js` 当前实际接入的是 `services/collab/collab-basic-service.js`

## 建议拆法

1. 先确定唯一协同协议，保留一条主线。
2. 把协同抽成分层结构：
   - transport：连接和消息编解码
   - domain：block/page/comment/history/canvas 领域操作
   - ui adapter：给 editor 页面消费的组合式接口
3. 用统一消息类型声明替代散落的字符串常量。
4. 在后端同步删除废弃协同服务，避免继续双轨演化。

## 预期结果

- 连接和协议只维护一份。
- 画布、评论、历史、房间管理都能在统一接口下演进。
- 后续加权限、断线重连、增量同步时不会重复施工。
