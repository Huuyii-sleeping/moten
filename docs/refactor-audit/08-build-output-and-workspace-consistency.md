# 08 构建产物与 Workspace 一致性

## 现状

workspace 已经搭起来了，但包之间的构建出口约定并不一致。

## 直接证据

- `packages/moten-ui/src/main.ts` 和 `packages/moten-ui/vite.config.ts`
- `packages/moten-playground/vue3/src/main.ts`
- `packages/moten-editor/src/main.ts`

## 已观察到的问题

- `@moten/ui` 实际样式产物为 `dist/theme/moten.css`
- `packages/moten-editor/src/main.ts` 引用的是 `@moten/ui/dist/theme/moten.css`
- `packages/moten-playground/vue3/src/main.ts` 引用的是 `@moten/ui/dist/moten.css`
- 因此 playground 构建失败

## 其他一致性问题

- `moten-ui` 的 `package.json` 声明了 `main/module/types`，但样式导出没有显式 package exports。
- repo 里混有 `pnpm-lock.yaml`，部分子包还有 `package-lock.json`。
- 根 README 和实际构建输出存在偏差。

## 建议拆法

1. 为 `@moten/ui` 明确声明 `exports`。
2. 给样式提供稳定入口，例如：
   - `@moten/ui/style`
   - `@moten/ui/dist/theme/moten.css`
3. 清理 workspace 中不应存在的子包 `package-lock.json`。
4. 用一次 smoke build 覆盖 UI、editor、playground 三个消费方。

## 预期结果

- 消费方不再依赖“猜路径”。
- playground、editor、外部使用者的导入方式统一。
- monorepo 的包边界更稳定。
