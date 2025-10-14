export class PerformanceAnalyzer {
  static analyze(reports: any[]) {
    const issues = []

    for (const report of reports) {
      if (report.avgDuration > 1000) {
        issues.push({
          type: 'slow-render',
          componentName: report.componentName,
          message: `组件渲染平均耗时 ${Math.round(report.avgDuration)}ms，建议优化`,
          severity: 'high',
        })
      }
      if (report.renderCount > 100) {
        issues.push({
          type: 'frequent-render',
          componentName: report.componentName,
          message: `组件在短时间内渲染 ${report.renderCount} 次，可能存在不必要的更新`,
          severity: 'medium',
        })
      }
    }
    return issues
  }
}
