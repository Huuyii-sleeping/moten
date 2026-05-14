# 05 配置面板字段渲染统一

## 现状

配置面板下存在大量“同一个模式，不同字段类型”的组件，每个组件都重复写一遍表单同步逻辑。

## 直接样本

- `packages/moten-editor/src/components/config/config-input.vue`
- `packages/moten-editor/src/components/config/config-textarea.vue`
- `packages/moten-editor/src/components/config/config-select.vue`
- `packages/moten-editor/src/components/config/config-upload.vue`
- `packages/moten-editor/src/components/config/config-color.vue`
- `packages/moten-editor/src/components/config/config-dropdown.vue`

## 重复点

- 从 `props.data` 拆 `formData/key/id`
- 根据 `viewport` 取默认值
- `watch(formData)` 回填输入值
- `watch(localValue)` 再 emit 更新
- 当表单值缺少双端数据时，补 `desktop/mobile`

## 问题

- 小组件数量很多，但大部分是样板代码。
- 任何一个数据同步 bug 会在多个组件重复出现。
- 增加新控件成本偏高，因为每次都要重写同样的桥接逻辑。

## 建议拆法

1. 抽出 `useViewportFieldModel(data, viewport)`。
2. 抽出基础字段组件层：
   - text
   - textarea
   - boolean
   - select
   - media
3. 由 schema 决定渲染哪类字段组件，而不是大量手写桥接文件。
4. 长期可以演进为 schema-driven form renderer。

## 预期结果

- 配置字段新增成本明显下降。
- 视口双端同步规则只维护一份。
- 表单行为更一致。
