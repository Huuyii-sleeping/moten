export const performanceApi = {
  reportComponent: async (data: any) => {
    const response = await fetch('http://localhost:8081/api/performance/component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await response.json()
  },

  getPerformancReport: async () => {
    const response = await fetch('http://localhost:8081/api/performance/report')
    return await response.json()
  },
}
