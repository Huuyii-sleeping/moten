# 07 插件系统边界加固

## 现状

当前插件系统更接近可运行原型，还没有形成清晰、稳定、安全的边界。

## 关键文件

- 前端加载器：`packages/moten-editor/src/utils/pluginManager.ts`
- 前端使用点：
  - `packages/moten-editor/src/components/edit/edit-block.vue`
  - `packages/moten-editor/src/components/edit/edit-render-drag.vue`
  - `packages/moten-editor/src/components/edit/InteractPreviewRender.vue`
- 后端插件数据：
  - `packages/moten-server/models/plugins.js`
  - `packages/moten-server/models/installPlugins.js`

## 重复点

- 多个渲染组件分别处理插件 component fallback。
- 插件元数据和安装记录都停留在内存结构，前后端责任不清。
- 插件样式注入、组件构建、默认 props 推导都混在一个 manager 里。

## 问题

- `new Function` 动态执行的边界脆弱。
- 插件市场数据没有持久化和版本控制。
- 插件渲染、插件注册、插件市场、插件审核耦合在一起。

## 建议拆法

1. 把插件系统切成三层：
   - plugin registry
   - plugin runtime
   - plugin marketplace
2. 为插件定义明确 manifest 契约。
3. 用白名单 runtime API 代替隐式全局访问。
4. 后端把插件和安装记录迁出内存模型。

## 预期结果

- 插件加载边界更清楚。
- 插件市场和运行时不再互相污染。
- 后续才能安全支持更多插件类型。
