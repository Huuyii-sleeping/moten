<script setup>
import { ref, onMounted } from 'vue'

const performanceLogs = ref([])

onMounted(async () => {
  const res = await fetch('/api/logs/monitor/performance?page=1&limit=100')
  const data = await res.json()
  performanceLogs.value = data.data
})
</script>