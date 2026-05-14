# 03 评论与 Mention 面板重复实现

## 现状

评论和 `@mention` 相关 UI 已经在两个地方分别实现了一套。

- `packages/moten-editor/src/components/edit/edit-config.vue`
- `packages/moten-editor/src/components/edit/edit-bottom-toolbar.vue`

## 重复点

- 评论列表渲染
- 评论拉取
- 用户列表拉取
- `@mention` 弹层
- 选择用户后的文本替换
- 评论提交和解决评论
- 时间格式化和滚动到底部

## 问题

- 两处 UI 有相同业务逻辑，但细节已经开始分叉。
- 一处改 bug，另一处大概率会漏改。
- 评论体验和协同状态处理不一致，用户会看到不同表现。

## 建议拆法

1. 抽出 `useCommentPanel` composable，统一管理：
   - comments
   - mentions
   - fetch
   - add
   - resolve
   - scroll behavior
2. 抽出一个公共组件，例如 `CommentPanel.vue`。
3. `edit-config.vue` 和 `edit-bottom-toolbar.vue` 只保留容器职责。

## 预期结果

- 评论逻辑只有一份。
- mention 行为一致。
- 后面增加附件、筛选、未解决计数时不会重复改两套。
