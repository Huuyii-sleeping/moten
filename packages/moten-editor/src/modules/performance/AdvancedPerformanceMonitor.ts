export interface PerformanceMetrics {
  renderDuration: number
  memoryUsage: number
  fps: number
  propsSize: number
  childrenCount: number
  reactiveUpdates: number
}

export interface PerformanceReport {
  componentId: string
  componentName: string
  metrics: PerformanceMetrics
  issues: PerformanceIssue[]
  recommendations: string[]
  timestamp: number
}

export interface PerformanceIssue {
  type: 'slow-render' | 'memory-leak' | 'excessive-props' | 'frequent-updates'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
}

export class AdvancedPerformanceMonitor {
  private static instance: AdvancedPerformanceMonitor
  private metrics = new Map<string, PerformanceMetrics>()
  private activeComponents = new Map<
    string,
    {
      startTime: number
      updateCount: number
      observer: ResizeObserver | null
    }
  >()
  private memoryObserver: PerformanceObserver | null = null

  private constructor() {
    this.initMemoryObserver()
  }

  static getInstance(): AdvancedPerformanceMonitor {
    if (!AdvancedPerformanceMonitor.instance) {
      AdvancedPerformanceMonitor.instance = new AdvancedPerformanceMonitor()
    }
    return AdvancedPerformanceMonitor.instance
  }

  // 初始化内存监控
  private initMemoryObserver() {
    if ('PerformanceObserver' in window) {
      this.memoryObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log('性能指标:', entry.name, entry.duration)
          }
        })
      })
      this.memoryObserver.observe({ entryTypes: ['measure'] })
    }
  }

  // 开始监控组件（增强版）
  startMonitoringComponent(componentId: string, element?: HTMLElement) {
    if (this.activeComponents.has(componentId)) return

    const startTime = performance.now()

    // 创建 ResizeObserver 监控布局变化
    let observer: ResizeObserver | null = null
    if (element) {
      observer = new ResizeObserver(() => {
        // 布局变化可能影响性能
        console.log(`组件 ${componentId} 发生布局变化`)
      })
      observer.observe(element)
    }

    this.activeComponents.set(componentId, {
      startTime,
      updateCount: 0,
      observer,
    })

    // 开始内存监控
    if ('memory' in performance) {
      // @ts-ignore
      const memory = performance.memory as any
      console.log('内存使用:', memory.usedJSHeapSize / 1048576, 'MB')
    }
  }

  // 记录响应式更新
  recordReactivityUpdate(componentId: string) {
    const component = this.activeComponents.get(componentId)
    if (component) {
      component.updateCount++
    }
  }

  // 结束监控并生成完整报告
  endMonitoringComponent(componentId: string, props?: any, children?: any[]): PerformanceReport {
    const component = this.activeComponents.get(componentId)
    if (!component) {
      throw new Error(`未找到活跃的组件: ${componentId}`)
    }

    const endTime = performance.now()
    const duration = endTime - component.startTime

    // 计算 Props 大小
    const propsSize = props ? this.calculateObjectSize(props) : 0
    const childrenCount = children ? children.length : 0

    // 估算内存使用（简化版）
    const memoryUsage = this.estimateMemoryUsage(duration, propsSize, childrenCount)

    // 计算 FPS（简化：基于渲染时间）
    const fps = duration > 0 ? Math.min(60, Math.round(1000 / duration)) : 0

    const metrics: PerformanceMetrics = {
      renderDuration: duration,
      memoryUsage,
      fps,
      propsSize,
      childrenCount,
      reactiveUpdates: component.updateCount,
    }

    // 识别性能问题
    const issues = this.identifyIssues(componentId, metrics)

    // 生成优化建议
    const recommendations = this.generateRecommendations(issues)

    const report: PerformanceReport = {
      componentId,
      componentName: componentId,
      metrics,
      issues,
      recommendations,
      timestamp: Date.now(),
    }

    // 清理资源
    if (component.observer) {
      component.observer.disconnect()
    }
    this.activeComponents.delete(componentId)
    this.metrics.set(componentId, metrics)

    // 上报到后端
    this.reportToServer(report)

    return report
  }

  // 计算对象大小（字节）
  private calculateObjectSize(obj: any): number {
    try {
      return new Blob([JSON.stringify(obj)]).size
    } catch {
      return 0
    }
  }

  // 估算内存使用
  private estimateMemoryUsage(duration: number, propsSize: number, childrenCount: number): number {
    // 简化算法：基于渲染时间和数据大小
    return Math.round(duration * 0.1 + propsSize / 1024 + childrenCount * 2)
  }

  // 识别性能问题
  private identifyIssues(componentId: string, metrics: PerformanceMetrics): PerformanceIssue[] {
    const issues: PerformanceIssue[] = []

    // 渲染耗时过长
    if (metrics.renderDuration > 100) {
      issues.push({
        type: 'slow-render',
        severity: metrics.renderDuration > 500 ? 'critical' : 'high',
        message: `组件渲染耗时 ${Math.round(metrics.renderDuration)}ms，超过推荐值 100ms`,
        value: metrics.renderDuration,
        threshold: 100,
      })
    }

    // Props 过大
    if (metrics.propsSize > 1024 * 1024) {
      // 1MB
      issues.push({
        type: 'excessive-props',
        severity: 'medium',
        message: `组件 Props 大小为 ${(metrics.propsSize / 1024 / 1024).toFixed(2)}MB，建议优化`,
        value: metrics.propsSize,
        threshold: 1024 * 1024,
      })
    }

    // 更新过于频繁
    if (metrics.reactiveUpdates > 50) {
      issues.push({
        type: 'frequent-updates',
        severity: 'high',
        message: `组件在单次渲染中触发 ${metrics.reactiveUpdates} 次响应式更新`,
        value: metrics.reactiveUpdates,
        threshold: 50,
      })
    }

    // 内存占用过高
    if (metrics.memoryUsage > 200) {
      issues.push({
        type: 'memory-leak',
        severity: 'high',
        message: `组件内存占用 ${metrics.memoryUsage}MB，可能存在内存泄漏`,
        value: metrics.memoryUsage,
        threshold: 200,
      })
    }

    return issues
  }

  // 生成优化建议
  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = []

    const hasSlowRender = issues.some((issue) => issue.type === 'slow-render')
    const hasExcessiveProps = issues.some((issue) => issue.type === 'excessive-props')
    const hasFrequentUpdates = issues.some((issue) => issue.type === 'frequent-updates')

    if (hasSlowRender) {
      recommendations.push(
        '使用 Vue 3 的 <Suspense> 组件进行懒加载',
        '考虑将大型组件拆分为更小的子组件',
        '使用 v-memo 优化列表渲染',
      )
    }

    if (hasExcessiveProps) {
      recommendations.push(
        '使用 shallowRef 或 shallowReactive 减少响应式开销',
        '避免传递整个对象，只传递需要的属性',
        '使用计算属性替代大型 Props',
      )
    }

    if (hasFrequentUpdates) {
      recommendations.push(
        '检查不必要的响应式依赖',
        '使用 computed 缓存计算结果',
        '避免在模板中调用方法',
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('组件性能良好，无需优化')
    }

    return recommendations
  }

  // 上报到后端
  private async reportToServer(report: PerformanceReport): Promise<void> {
    try {
      await fetch('/api/performance/component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      })
    } catch (error) {
      console.warn('性能数据上报失败:', error)
    }
  }
}
