# 09 命名、本地存储和接口契约统一

## 现状

项目里已经出现了多套命名和 key 约定并存的问题，这会持续放大维护成本。

## 直接样本

- `collab_user_id`
- `collab_username`
- `collab_user_name`
- `collab_docId`
- `collab_room_id`
- `isEditor`
- `roomId`
- `docId`

这些 key 分散在以下文件中：

- `packages/moten-editor/src/stores/collaborationStore.ts`
- `packages/moten-editor/src/stores/CRDT/collaborationStore.ts`
- `packages/moten-editor/src/stores/roomStore.ts`
- `packages/moten-editor/src/components/edit/edit-header.vue`

## 重复点

- 同一个概念被多个名字表示。
- 本地存储读写逻辑在多个模块各自硬编码。
- 协同接口消息类型散落为字符串字面量。

## 问题

- 很容易出现某处写 `collab_user_name`，另一处读 `collab_username` 的问题。
- 房间、文档、用户身份边界没有统一建模。
- 字符串协议扩展时缺少集中约束。

## 建议拆法

1. 统一命名词汇表：
   - room
   - document
   - participant
   - user
2. 抽出 `collabStorageKeys.ts`。
3. 抽出 `collabMessageTypes.ts` 或共享协议声明。
4. 对 REST 返回体和 WS 消息体建立统一类型。

## 预期结果

- 跨模块沟通成本下降。
- 本地存储和协议调试更简单。
- 后续重构不会被隐式字符串拖慢。
