# Moten ✨

**Vue 3 组件开发全链路加速器**—— 用「组件库 + 编辑器 + 预览台」的黄金组合，让你的组件开发效率起飞 🚀

## 项目介绍

Moten 是一套面向 Vue 3 生态的组件开发全链路解决方案，旨在解决传统组件开发中「工具链分散、重复劳动多、跨端适配难」等问题。

与传统组件库不同，Moten 提供的是从「组件编码」到「可视化配置」再到「多端预览」的完整闭环，让开发者专注于创造性工作而非重复劳动。

## 核心功能

### 1. 核心模块

- **moten-ui**：轻量高效的 Vue 3 组件库，gzip 后仅 8KB，支持按需加载和样式原子化，针对真实业务场景优化。
- **moten-editor**：可视化组件开发工具，支持「拖拽 + 代码」双模式编辑，实时语法校验与代码优化。
- **moten-playground**：支持手机 / 平板 / 桌面端同屏展示，内置性能分析工具。

### 2. 工程化亮点

- 基于 PNPM Workspace 实现多包协同，版本联动无冲突
- 内置 Husky + ESLint 质量门禁，保障代码规范
- 自动化版本管理与 CHANGELOG 生成
- Vite 构建优化，开发热更新 < 300ms，生产包体积比同类工具小 30%

## 快速开始

### 环境要求

- Node.js ≥ 20.x
- PNPM ≥ 10.x

### 安装依赖

bash

```bash
# 克隆仓库
git clone https://github.com/your-username/moten.git
cd moten

# 安装依赖
pnpm install
```

### 开发模式

bash

```bash
# 启动编辑器（核心开发入口）
pnpm dev

# 单独启动组件库示例
pnpm ui

# 单独启动 Vue 3 预览台
pnpm v3
```

### 构建生产版本

bash

```bash
# 构建编辑器
cd packages/moten-editor
pnpm build

# 构建组件库
cd packages/moten-ui
pnpm build
```

## GitHub Pages 部署

1. 构建预览台产物：
    
    bash
    
    ```bash
    cd packages/moten-playground/vue3
    pnpm build
    ```
    
2. 将 `dist` 目录内容推送到 `gh-pages` 分支：
    
    bash
    
    ```bash
    # 安装部署工具（如需要）
    pnpm add -g gh-pages
    
    # 部署
    gh-pages -d dist
    ```
    
1. 在 GitHub 仓库设置中，将 GitHub Pages 源指向 `gh-pages` 分支，访问 [低代码平台 Moten](https://huuyii-sleeping.github.io/moten/#/edit) 即可查看在线演示。
    

## 资源与文档

- [完整文档](https://moten-docs.example.com/)
- [展示区域](https://huuyii-sleeping.github.io/moten/#/edit)