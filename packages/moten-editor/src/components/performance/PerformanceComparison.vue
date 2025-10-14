<template>
  <div class="performance-comparison">
    <h3>📊 性能对比</h3>
    <div class="comparison-chart">
      <div class="chart-title">渲染时间对比 (ms)</div>
      <echarts :options="renderTimeOptions" />
    </div>
    <div class="comparison-table">
      <el-table :data="comparisonResults" border>
        <el-table-column prop="componentName" label="组件库" width="180" />
        <el-table-column prop="duration" label="渲染时间 (ms)" width="120" />
        <el-table-column prop="memoryUsage" label="内存占用 (MB)" width="120" />
        <el-table-column prop="renderCount" label="渲染次数" width="120" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button @click="showDetails(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PerformanceComparison } from '@/modules/performance/PerformanceComparison'
import { PerformanceAnalyzer } from '@/modules/performance/PerformanceAnalyzer'
import { OptimizationSuggestions } from '@/modules/performance/OptimizationSuggestions'
import { ElMessageBox } from 'element-plus'
import { useEditStore } from '@/stores/edit'

const comparisonResults = ref([])
const renderTimeOptions = ref({})

const edit = useEditStore()

onMounted(async () => {
  const components = edit.blockConfig.map((b) => ({ name: b.id, component: [] }))
  const results = await PerformanceComparison.compare(components)
  comparisonResults.value = results as any
  generateCharts(results)
})

function generateCharts(results: any) {
  renderTimeOptions.value = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: results.map((r: any) => r.componentName) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '渲染时间',
        type: 'bar',
        data: results.map((r: any) => r.duration),
        itemStyle: { color: '#5470C6' },
      },
    ],
  }
}

function showDetails(row: any) {
  const issues = PerformanceAnalyzer.analyze([row])
  const suggestions = OptimizationSuggestions.getSuggestions(issues)

  ElMessageBox.alert(
    `<div style="max-height: 300px; overflow-y: auto;">${suggestions.map((s) => `<p><strong>${s.title}</strong>: ${s.description}</p>`).join('')}</div>`,
    '优化建议',
    { dangerouslyUseHTMLString: true },
  )
}
</script>

<style scoped lang="scss">
.performance-comparison {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    color: #333;
  }

  .comparison-chart {
    margin-bottom: 20px;

    .chart-title {
      margin-bottom: 8px;
      font-weight: 600;
    }
  }

  .comparison-table {
    .el-table {
      width: 100%;
    }
  }
}
</style>
