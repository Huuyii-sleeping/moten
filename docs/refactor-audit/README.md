# Moten Refactor Audit

这组文档用于整理当前仓库中最值得优先处理的重构点，重点关注重复操作、职责混杂、实现分叉、状态边界不清和构建一致性问题。

## 建议优先级

1. `01-collaboration-consolidation.md`
2. `02-editor-state-and-side-effects.md`
3. `03-comment-and-mention-ui-duplication.md`
4. `04-page-publish-export-flow.md`
5. `05-config-panel-renderer-unification.md`
6. `06-backend-crud-abstraction.md`
7. `07-plugin-system-hardening.md`
8. `08-build-output-and-workspace-consistency.md`
9. `09-naming-storage-and-contract-normalization.md`

## 总结

- 前端最重的重复来自协同编辑、评论面板、配置面板表单组件、页面发布链路。
- 后端最明显的重复来自 page 和 package 的 CRUD 结构、controller/dao 模板代码、协同服务双实现。
- 工程层的主要问题是构建产物路径不一致、命名和本地存储 key 不统一、模块边界不清。

## 推荐分期

### Phase 1

- 收敛协同实现
- 拆分 editor store 副作用
- 合并评论面板逻辑

### Phase 2

- 收敛页面发布/导出流程
- 统一配置面板字段渲染
- 抽象后端 CRUD 基类

### Phase 3

- 重做插件边界
- 整理构建和包导出约定
- 统一命名、存储 key、接口契约
