// utils/performanceMonitor.ts
export const initPerformanceMonitoring = () => {
  // 监控 LCP（最大内容绘制）
  const lcpObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      reportPerformance('lcp', entry.startTime)
    }
  })
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

  // 监控 FID（首次输入延迟）
  const fidObserver = new PerformanceObserver((entryList: any) => {
    for (const entry of entryList.getEntries()) {
      reportPerformance('fid', entry.processingStart - entry.startTime)
    }
  })
  fidObserver.observe({ type: 'first-input', buffered: true })

  // 监控 CLS（累积布局偏移）
  let clsValue = 0
  const clsObserver = new PerformanceObserver((entryList: any) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
        reportPerformance('cls', clsValue)
      }
    }
  })
  clsObserver.observe({ type: 'layout-shift', buffered: true })

  // 页面加载完成时上报
  window.addEventListener('load', () => {
    const navEntry = performance.getEntriesByType('navigation')[0]
    if (navEntry) {
      reportPerformance('page-load', navEntry.duration)
    }
  })
}

function reportPerformance(metric: string, value: number) {
  fetch('/api/monitor/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric,
      value: Math.round(value),
      pageUrl: location.href,
      timestamp: Date.now(),
    }),
  }).catch(console.error)
}
