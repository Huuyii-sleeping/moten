export class OptimizationSuggestions {
  static getSuggestions(issues: any[]) {
    const suggestions = []
    for (const issue of issues) {
      switch (issue.Type) {
        case 'slow-render':
          suggestions.push({
            title: '优化渲染性能',
            description: `考虑使用 Vue 3 的 <Suspense> 组件或懒加载策略`,
            code: `import { defineAsyncComponent } from 'vue'\n\nconst AsyncComponent = defineAsyncComponent(() => import('./MyComponent.vue'))`,
          })
          break
        case 'frequent-render':
          suggestions.push({
            title: '避免不必要的重新渲染',
            description: `使用 v-memo 或 shouldUpdate 判断是否需要更新`,
            code: `<template>\n  <div v-memo="[prop1, prop2]">\n    <!-- 内容 -->\n  </div>\n</template>`,
          })
          break
      }
    }
    return suggestions
  }
}
