// src/modules/performance/PerformanceMonitor.ts
/**
 * 组件性能监控工具类
 * 用于跟踪和分析 Vue 组件的渲染性能
 * 单例模式，确保整个应用中只有一个性能监控实例
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private componentMetrics = new Map<string, ComponentMetrics>()
  private performanceObserver: PerformanceObserver | null = null
  private activeComponents = new Set<string>()

  private constructor() {
    this.initPerformanceObserver()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 初始化性能观察器
   */
  private initPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordMeasure(entry)
          }
        }
      })
      this.performanceObserver.observe({ entryTypes: ['measure'] })
    }
  }

  /**
   * 记录组件渲染性能（传统方式）
   */
  recordComponent(componentName: string, startTime: number, endTime: number): void {
    const duration = endTime - startTime
    const metrics = this.getComponentMetrics(componentName)

    // 更新指标
    metrics.count++
    metrics.totalDuration += duration
    metrics.maxDuration = Math.max(metrics.maxDuration, duration)
    metrics.minDuration = Math.min(metrics.minDuration, duration)
    metrics.renderCount++

    this.componentMetrics.set(componentName, metrics)

    // 上报到服务器
    this.reportToServer({
      componentName,
      duration,
      timestamp: Date.now(),
    })
  }

  /**
   * 处理自定义性能指标（来自 PerformanceObserver）
   */
  private recordMeasure(entry: PerformanceEntry): void {
    const [componentName, metricName] = entry.name.split(':')
    if (componentName && metricName) {
      const metrics = this.getComponentMetrics(componentName) as any
      metrics[metricName] = entry.duration
      this.componentMetrics.set(componentName, metrics)
    }
  }

  /**
   * 开始监控指定组件
   */
  startMonitoringComponent(componentId: string): void {
    if (this.activeComponents.has(componentId)) return

    this.activeComponents.add(componentId)
    const startTime = performance.now()

    this.componentMetrics.set(componentId, {
      count: 0,
      totalDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
      renderCount: 0,
      startTime,
    })
  }

  /**
   * 结束监控指定组件
   */
  endMonitoringComponent(componentId: string): void {
    if (!this.activeComponents.has(componentId)) return

    const metrics = this.componentMetrics.get(componentId)
    if (metrics && metrics.startTime !== undefined) {
      const endTime = performance.now()
      const duration = endTime - metrics.startTime

      // 更新指标
      metrics.count++
      metrics.totalDuration += duration
      metrics.maxDuration = Math.max(metrics.maxDuration, duration)
      metrics.minDuration = Math.min(metrics.minDuration, duration)
      metrics.renderCount++
      metrics.lastDuration = duration

      // 上报到服务器
      this.reportToServer({
        componentId,
        duration,
        timestamp: Date.now(),
      })
    }

    this.activeComponents.delete(componentId)
  }

  /**
   * 获取组件性能报告
   */
  getReport(): PerformanceReport[] {
    const reports: PerformanceReport[] = []

    for (const [componentName, metrics] of this.componentMetrics.entries()) {
      if (metrics.count > 0) {
        reports.push({
          componentName,
          avgDuration: metrics.totalDuration / metrics.count,
          maxDuration: metrics.maxDuration,
          minDuration: metrics.minDuration === Infinity ? 0 : metrics.minDuration,
          renderCount: metrics.renderCount,
          lastDuration: metrics.lastDuration || 0,
          memoryUsage: this.getMemoryUsage(componentName),
        })
      }
    }

    return reports.sort((a, b) => b.avgDuration - a.avgDuration)
  }

  /**
   * 获取指定组件的性能报告
   */
  getReportForComponent(componentId: string): PerformanceReport | null {
    const metrics = this.componentMetrics.get(componentId)
    if (!metrics || metrics.count === 0) {
      return null
    }

    return {
      componentName: componentId,
      avgDuration: metrics.totalDuration / metrics.count,
      maxDuration: metrics.maxDuration,
      minDuration: metrics.minDuration === Infinity ? 0 : metrics.minDuration,
      renderCount: metrics.renderCount,
      lastDuration: metrics.lastDuration || 0,
      memoryUsage: this.getMemoryUsage(componentId),
    }
  }

  /**
   * 数据上报到服务器
   */
  private async reportToServer(data: PerformanceData): Promise<void> {
    try {
      await fetch('http://localhost:8081/api/performance/component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn('性能数据上报失败:', error)
    }
  }

  /**
   * 获取内存使用情况（模拟实现）
   */
  private getMemoryUsage(componentName: string): number {
    // TODO: 实际项目中应使用更精确的内存监控方法
    // 这里返回模拟值用于演示
    return Math.floor(Math.random() * 100)
  }

  /**
   * 获取或初始化组件指标
   */
  private getComponentMetrics(componentName: string): ComponentMetrics {
    return (
      this.componentMetrics.get(componentName) || {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        renderCount: 0,
      }
    )
  }
}

// TypeScript 类型定义
interface ComponentMetrics {
  count: number
  totalDuration: number
  maxDuration: number
  minDuration: number
  renderCount: number
  startTime?: number
  lastDuration?: number
}

interface PerformanceReport {
  componentName: string
  avgDuration: number
  maxDuration: number
  minDuration: number
  renderCount: number
  lastDuration: number
  memoryUsage: number
}

interface PerformanceData {
  componentName?: string
  componentId?: string
  duration: number
  timestamp: number
}
