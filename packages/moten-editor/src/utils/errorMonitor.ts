// utils/errorMonitor.ts
export const initErrorMonitoring = () => {
  // 全局 JS 错误
  window.addEventListener('error', (event: ErrorEvent) => {
    if (!event.error) return

    reportError({
      type: 'js-error',
      message: event.error.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error.stack || '',
      url: location.href,
    })
  })

  // Promise 拒绝未处理
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    reportError({
      type: 'unhandled-promise',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      url: location.href,
    })
  })
}

function reportError(errorInfo: any) {
  fetch('/api/monitor/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...errorInfo,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }),
  }).catch(console.error)
}
