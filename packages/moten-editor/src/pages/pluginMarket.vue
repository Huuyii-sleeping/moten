<template>
  <div class="plugin-market">
    <div class="market-header">
      <h2>插件市场</h2>
      <div style="display: flex">
        <el-button type="primary" @click="router.push('/plugins/upload')">上传</el-button>
        <el-button type="primary" @click="router.push('/plugins/review')">审核</el-button>
      </div>
    </div>

    <div class="plugin-list">
      <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
        <img :src="plugin.icon" alt="icon" class="icon" />
        <h3>{{ plugin.name }}</h3>
        <p class="desc">{{ plugin.description }}</p>
        <div class="meta">
          <span>作者: {{ plugin.author }}</span>
          <span>评分: {{ plugin.rating }}⭐</span>
          <span>下载: {{ plugin.downloadCount }}</span>
        </div>
        <el-button v-if="!isInstalled(plugin.id)" @click="installPlugin(plugin)" type="primary"
          >install</el-button
        >
        <el-button v-else type="info" disabled>installed</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getInstalledPluginsAsync, installPluginsAsync, loadingUniquePluginsAsync } from '@/api/plugins'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const plugins = ref<any[]>([])
const installedPlugins = ref<any>([])
const installPlugin = async (plugin: any) => {
  try {
    const res = await installPluginsAsync({ pluginId: plugin.id })
    if (res.status) {
      installedPlugins.value.push(plugin.id)
      ElMessage.success('安装成功')
      const res = await getInstalledPluginsAsync()
      console.log(res)
    } else {
      ElMessage.warning('安装失败')
    }
  } catch (error: any) {
    console.warn('安装失败:', error.message)
  }
}
const isInstalled = (id: string) => {
  return installedPlugins.value.includes(id)
}
onMounted(async () => {
  try {
    const res = await loadingUniquePluginsAsync({ status: 'published' })
    if (res.status) {
      const { data } = res
      plugins.value = data
    }
  } catch (error: any) {
    console.warn('获取插件列表失败', error.message)
  }
})
</script>

<style scoped lang="scss">
.market-header {
  display: flex;
  justify-content: space-between;
}
// 全局容器样式优化
.plugin-market {
  padding: 30px 40px;
  background-color: #f8f9fa; // 浅灰背景提升页面质感
  height: 100vh;
}

// 标题样式
.plugin-market h2 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 28px 0;
  border-left: 4px solid #409eff; // 左侧蓝色标强调标题
  padding-left: 12px;
}

// 插件列表网格优化
.plugin-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); // 卡片宽度微调
  gap: 24px; // 增大卡片间距，避免拥挤
}

// 插件卡片核心样式美化
.plugin-card {
  border: 1px solid #e5e7eb;
  padding: 20px;
  border-radius: 10px; // 圆角优化
  background: #fff;
  transition: all 0.3s ease; // 平滑过渡效果
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); // 轻微阴影提升层次感

  // 鼠标悬浮交互
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); // 悬浮加深阴影
    border-color: #409eff; // 边框变主题色
    transform: translateY(-2px); // 轻微上浮，增强交互感
  }
}

// 图标样式优化
.icon {
  width: 64px;
  height: 64px;
  object-fit: contain; // 保持图标比例，避免拉伸
  margin-bottom: 14px;
  border-radius: 8px; // 图标圆角，更精致
  background-color: #f0f7ff; // 浅色背景衬托图标
  padding: 8px; // 内边距，避免图标贴边
}

// 插件名称样式
.plugin-card h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 10px 0;
  white-space: nowrap; // 防止名称换行
  overflow: hidden; // 超出隐藏
  text-overflow: ellipsis; // 省略号显示
}

// 描述文本样式
.desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box; // 多行文本控制
  -webkit-line-clamp: 2; // 最多显示2行
  -webkit-box-orient: vertical;
  overflow: hidden; // 超出隐藏
}

// 元信息区域样式
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 0;
  margin-bottom: 18px; // 调整与按钮间距
  gap: 8px; // 防止内容拥挤
}
.el-button {
  width: 100%;
}
</style>
