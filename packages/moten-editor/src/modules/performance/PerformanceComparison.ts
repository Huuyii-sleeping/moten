import { createApp, type App, nextTick, render } from 'vue'

export class PerformanceComparison {
  static async compare(
    components: Array<{
      name: string
      component: any
      props?: Record<string, any>
      interactions?: () => Promise<void>
    }>,
  ) {
    const results = [] as any
    for (const { name, component, props = {}, interactions = async () => {} } of components) {
      const container = document.createElement('div')
      container.id = `test-container-${name}`
      document.body.appendChild(container)
      const startTime = performance.now()
      let app: App | null = null
      try {
        app = createApp(component, props)
        app.mount(container)
        await nextTick()
        // 模拟用户交互
        await interactions()
        await nextTick()
        const memoryUsage = this.measureMemoryUsage()
        const endTime = performance.now()
        const duration = endTime - startTime

        results.push({
          componentName: name,
          duration: parseFloat(duration.toFixed(2)),
          memoryUsage: parseFloat(memoryUsage.toFixed(2)),
          renderCount: this.countRenders(container),
        })
      } finally {
        if (app) app.unmount()
        container.remove()
        if (globalThis.gc) globalThis.gc()
      }
    }
    return results.sort((a: any, b: any) => a.duration - b.duration)
  }

  private static measureMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance.memory as any).usedJSHeapSize / (1024 * 1024)
    }
    return 0
  }

  private static countRenders(container: HTMLElement): number {
    const observe = new MutationObserver(() => {})
    observe.observe(container, { childList: true, subtree: true })
    const renderCount = observe.takeRecords().length
    observe.disconnect()
    return Math.max(1, renderCount)
  }
}
