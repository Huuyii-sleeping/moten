<template>
  <div class="plugin-admin">
    <h2>插件审核中心</h2>
    <div v-for="plugin in pendingPlugins" :key="plugin.id" class="plugin-item">
      <h3>{{ plugin.name }} (v{{ plugin.version }})</h3>
      <p>作者: {{ plugin.author }}</p>
      <p>描述: {{ plugin.description }}</p>
      <div>
        <button @click="approve(plugin.id)">✅ 通过</button>
        <button @click="reject(plugin.id)">❌ 拒绝</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { approvePluginAsync, loadingUniquePluginsAsync, rejectPluginAsync } from '@/api/plugins'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

const pendingPlugins = ref<any>([])
const approve = async (pluginId: any) => {
  try {
    const res = await approvePluginAsync({ pluginId: pluginId })
    if (res.status) {
      ElMessage.success('approve plugin succeed')
      getPendingPlugins()
    } else {
      ElMessage.warning('approve plugin failed')
    }
  } catch (error: any) {
    ElMessage.warning('approve plugin failed')
    console.warn(error.message)
  }
}
const reject = async (pluginId: any) => {
  try {
    const res = await rejectPluginAsync({ pluginId: pluginId })
    if (res.status) {
      ElMessage.success('reject plugin succeed')
      getPendingPlugins()
    } else {
      ElMessage.warning('reject plugin failed')
    }
  } catch (error: any) {
    ElMessage.warning('reject plugin failed')
    console.warn(error.message)
  }
}
const getPendingPlugins = async () => {
  const res = await loadingUniquePluginsAsync({ status: 'pending' })
  if (res.status) {
    pendingPlugins.value = res.data
  } else {
    ElMessage.warning('获取pending列表失败')
  }
}
onMounted(() => {
  try {
    getPendingPlugins()
  } catch (error: any) {
    ElMessage.warning('获取pending列表失败')
    console.warn(error.message)
  }
})
</script>

<style scoped lang="scss">
// 页面容器样式
.plugin-admin {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

// 标题样式
.plugin-admin h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
}

// 待审核插件列表样式
.plugin-admin .plugin-item {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;
}

// 插件卡片hover效果
.plugin-admin .plugin-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

// 插件名称样式
.plugin-admin .plugin-item h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
}

// 插件信息文本样式
.plugin-admin .plugin-item p {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

// 按钮容器样式
.plugin-admin .plugin-item div {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

// 通过按钮样式
.plugin-admin .plugin-item button:first-child {
  padding: 8px 20px;
  background-color: #52c41a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.plugin-admin .plugin-item button:first-child:hover {
  background-color: #45a814;
}

// 拒绝按钮样式
.plugin-admin .plugin-item button:last-child {
  padding: 8px 20px;
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.plugin-admin .plugin-item button:last-child:hover {
  background-color: #d9363e;
}

// 空状态兜底（可选，预防无待审核插件时的空白）
@media (max-width: 768px) {
  .plugin-admin .plugin-item {
    padding: 16px;
  }

  .plugin-admin .plugin-item h3 {
    font-size: 16px;
  }

  .plugin-admin .plugin-item button {
    padding: 6px 16px;
    font-size: 13px;
  }
}
</style>
