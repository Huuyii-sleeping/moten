# 04 页面发布、编辑、导出流程收敛

## 现状

`packages/moten-editor/src/components/edit/edit-header.vue` 承担了过多业务。

## 重复点

- 新建发布和编辑发布都各自做了一遍：
  - `uploadImage`
  - block schema 校验
  - list 转 JSON
  - 成功/失败提示
  - 路由返回
- 导出项目和导出 PDF 逻辑也混在同一组件里。

## 直接证据

- `submit`
- `uploadEdite`
- `exportProject`
- `exportPDF`

都位于 `packages/moten-editor/src/components/edit/edit-header.vue`

## 问题

- header 组件已经不是 UI 组件，而是页面 orchestration 组件。
- 发布和编辑发布的差异很小，却维护了两套流程。
- 导出流程依赖协同房间本地 key，边界不稳定。

## 建议拆法

1. 抽出 `usePagePublish`：
   - collectPagePayload
   - validatePagePayload
   - uploadCover
   - createPage
   - updatePage
2. 抽出 `usePageExport`：
   - exportPdf
   - exportProjectZip
3. `edit-header.vue` 只负责按钮和触发事件。

## 预期结果

- 新建和编辑共用一条主流程。
- 导出逻辑可测试、可复用。
- header 组件职责回到展示层。
