# 02 Editor 状态与副作用拆分

## 现状

`packages/moten-editor/src/stores/edit.ts` 既保存编辑器状态，又负责对外发协同消息，还管理画布模式、评论开关、缩放、选中块等多类职责。

## 重复点

- `watch(blockConfig)` 和 `watch(pageConfig)` 里都直接触发远端同步和私有同步。
- 多个组件重复做 `setPreview`、`setConfigPanelShow`、`setCurrentSelect`、`disconnect`。
- 页面组件和 store 之间存在双向同步回写。

## 直接证据

- `packages/moten-editor/src/stores/edit.ts`
- `packages/moten-editor/src/components/edit/edit-render.vue`
- `packages/moten-editor/src/components/edit/InteractEditRender.vue`
- `packages/moten-editor/src/pages/preview.vue`
- `packages/moten-editor/src/components/edit/edit-header.vue`

## 问题

- store 里直接依赖协同 store，状态层和传输层耦合过深。
- `edit-render.vue` 和 `InteractEditRender.vue` 都在做 list 与 store 的镜像同步。
- UI 组件为了一个小交互，经常直接修改多个全局状态，难以追踪。

## 建议拆法

1. 把 `edit.ts` 拆成多个 store 或 composable：
   - `editorSessionStore`
   - `editorSelectionStore`
   - `editorCanvasStore`
   - `editorViewportStore`
2. 把协同同步从 `watch` 挪到显式 action 或 command 层。
3. 把 block/page 的修改入口统一成 `updateBlockConfig`、`updatePageConfig` 之类的命令式方法。
4. 渲染层只消费状态，不做二次镜像。

## 预期结果

- 修改来源更清晰。
- 协同、UI、画布不会继续互相缠绕。
- 后面做撤销重构、多人协同重构、性能优化时边界更稳定。
