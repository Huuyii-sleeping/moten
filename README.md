# Moten ✨

** Vue 3 组件开发全链路加速器 **—— 用「组件库+编辑器+预览台」的黄金组合，让你的组件开发效率起飞 🚀

## 🔥 为什么选择 Moten？

大多数组件库只给你「零件」，而 Moten 给你「生产线」：

-** 开发闭环 **：从组件编码 → 可视化配置 → 多端预览，无需切换工具链
-** 轻量不妥协 **：核心组件库 gzip 后仅 8KB，却包含企业级场景所需的全部基础能力
-** 零成本接入 **：Vue 3 原生语法兼容，无需学习新框架，10 分钟即可上手
-** 工程化开箱即用 **：内置经过验证的开发规范与构建流程，新项目初始化时间从 1 天缩短至 30 分钟

## 🧩 核心模块展示

### 1. moten-ui —— 为效率而生的组件库<template>
  <!-- 自动适配响应式布局 -->
  <MotenEmpty 
    description="暂无数据" 
    :image-size="res(120)"  <!-- 响应式尺寸工具 -->
  />
  
  <!-- 全类型支持，IDE智能提示 -->
  <MotenLink 
    href="/" 
    type="primary" 
    @click="handleClick"
  >
    跳转链接
  </MotenLink>
</template>

<script setup lang="ts">
import { MotenEmpty, MotenLink } from 'moten-ui'
import { res } from 'moten-ui/utils'  // 内置响应式工具

const handleClick = (e: MouseEvent) => {
  // TypeScript类型自动推导
  console.log('点击事件:', e)
}
</script>
✨** 特色 **：
- 「场景优先」设计：每个组件都针对真实业务场景优化（如空状态支持自定义图片+文案组合）
- 样式原子化：通过 Sass 混合器实现「一处定义，多处复用」，样式冗余减少 40%
- 按需加载：支持 Tree-Shaking，只打包用到的组件

### 2. moten-editor —— 组件开发的「可视化大脑」import { createEditor } from 'moten-editor'

// 初始化编辑器
const editor = createEditor('#editor-container', {
  // 预设组件库，支持拖拽配置
  components: ['MotenLink', 'MotenEmpty'],
  // 实时生成可复用代码
  onChange: (code) => {
    console.log('生成的代码:', code)
  },
  // 内置错误提示
  onError: (err) => {
    console.error('语法错误:', err.message)
  }
})

// 一键导出生产级代码
const productionCode = editor.optimizeCode()  // 自动移除调试代码、优化导入语句
✨** 特色 **：
- 「双模式编辑」：支持可视化拖拽 + 代码编辑实时同步
- 智能纠错：Vue 3 语法实时校验，错误定位精确到行列
- 代码优化器：自动精简冗余代码，生成符合 ESLint 规范的生产级代码

### 3. moten-playground —— 多维度预览「实验室」import { createPlayground } from 'moten-playground'

// 创建预览环境
createPlayground('#preview-container', {
  code: '<template><MotenLink /></template>',
  // 特色功能：多端同步预览
  devices: ['mobile', 'tablet', 'desktop'],
  // 实时主题切换
  theme: 'auto',  // 跟随系统明暗主题
  // 性能监控
  showPerformance: true  // 显示加载时间、重绘次数等指标
})
✨** 特色 **：
- 「三端同屏」：手机/平板/桌面端效果同时预览，响应式问题一目了然
- 性能透视：内置 Lighthouse 轻量分析器，组件加载性能数据可视化
- 沙箱隔离：通过 iframe + 自定义协议实现安全隔离，避免样式污染

## 🚀 30 秒快速上手
# 安装核心依赖
pnpm add moten-ui moten-editor moten-playground<!-- App.vue -->
<template>
  <div class="app">
    <h1>我的第一个 Moten 应用</h1>
    <MotenLink type="primary" href="/docs">查看文档</MotenLink>
  </div>
</template>

<script setup>
import { MotenLink } from 'moten-ui'
</script>

<style scoped>
.app {
  padding: res(20px);  /* 自动转换为响应式尺寸 */
}
</style>
## 🏭 工程化亮点

-** 多包协同 **：基于 PNPM Workspace 实现「组件库-编辑器-预览台」版本联动，避免依赖冲突
-** 质量门禁 **：通过 Husky + ESLint 构建「提交前校验 → 自动化测试 → 覆盖率检测」全链路保障，主分支零报错
-** 智能发布 **：基于 Git 提交信息自动生成版本号（如 `fix:` → patch 版本），CHANGELOG 自动同步
-** 极致构建 **：Vite 构建优化 + 按需编译，开发热更新速度 < 300ms，生产包体积比同类工具小 30%

## 📚 资源中心

- [完整文档](https://moten-docs.example.com)（含组件API、最佳实践）
- [在线演示](https://moten-playground.example.com)（可直接在浏览器中体验）
- [贡献指南](./CONTRIBUTING.md)（如何参与开发）
- [常见问题](./docs/FAQ.md)（解决90%的使用疑惑）

## 🔄 版本迭代

查看 [CHANGELOG.md](./CHANGELOG.md) 了解最新功能与更新记录。

## 📄 许可证

[MIT](./LICENSE) © 2023 Huuyii-sleeping

---

** 用 Moten，让组件开发从「重复劳动」变成「创造性工作」**💡
