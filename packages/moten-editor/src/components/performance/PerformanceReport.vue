<!-- src/components/Performance/PerformanceReport.vue -->
<template>
  <div class="performance-report">
    <h3>📈 性能报告</h3>
    <div v-if="loading" class="loading">正在加载...</div>
    <div v-else-if="issues.length === 0" class="no-issues">暂无性能问题</div>
    <div v-else class="issues-list">
      <div v-for="issue in issues" :key="issue.componentName" class="issue-item">
        <div class="issue-header">
          <span :class="`severity-${issue.severity}`">{{ issue.severity }}</span>
          {{ issue.message }}
        </div>
        <div
          class="suggestion"
          v-for="suggestion in getOptimizationSuggestions(issue)"
          :key="suggestion.title"
        >
          <h4>{{ suggestion.title }}</h4>
          <pre>{{ suggestion.code }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PerformanceMonitor } from '@/modules/performance/PerformanceMonitor'
import { PerformanceAnalyzer } from '@/modules/performance/PerformanceAnalyzer'
import { OptimizationSuggestions } from '@/modules/performance/OptimizationSuggestions'

const loading = ref(true)
const issues = ref([])

onMounted(async () => {
  const monitor = PerformanceMonitor.getInstance()
  const reports = monitor.getReport()

  const analyzer = new PerformanceAnalyzer()
  issues.value = analyzer.analyze(reports)

  loading.value = false
})

const getOptimizationSuggestions = (issue) => {
  const suggestions = OptimizationSuggestions.getSuggestions([issue])
  return suggestions
}
</script>

<style scoped lang="scss">
.performance-report {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    color: #333;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .no-issues {
    text-align: center;
    padding: 20px;
    color: #999;
  }

  .issues-list {
    .issue-item {
      background: #fff;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;

      .issue-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .severity-high {
          color: #e74c3c;
          font-weight: bold;
        }

        .severity-medium {
          color: #f39c12;
        }

        .severity-low {
          color: #2ecc71;
        }
      }

      .suggestion {
        background: #f9f9f9;
        border-left: 4px solid #ddd;
        padding: 8px;
        margin-top: 8px;

        h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #555;
        }

        pre {
          margin: 0;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          overflow-x: auto;
        }
      }
    }
  }
}
</style>
