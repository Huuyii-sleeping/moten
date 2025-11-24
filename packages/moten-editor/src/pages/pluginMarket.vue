<template>
  <div class="plugin-market">
    <!-- 头部区域 -->
    <div class="market-header">
      <div class="header-left">
        <h2>插件市场</h2>
        <p class="header-subtitle">发现并安装实用的插件，提升工作效率</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="router.push('/plugins/upload')" class="btn-upload">
          <el-icon class="btn-icon"><UploadFilled /></el-icon>
          上传插件
        </el-button>
        <el-button type="primary" @click="router.push('/plugins/review')" class="btn-review" plain>
          <el-icon class="btn-icon"><CircleCheckFilled /></el-icon>
          审核管理
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索插件名称、作者或描述"
        prefix-icon="Search"
        class="search-input"
      />
      <el-select
        v-model="sortType"
        placeholder="排序方式"
        class="sort-select"
        @change="handleSortChange"
      >
        <el-option label="最新发布" value="latest" />
        <el-option label="下载最多" value="downloads" />
        <el-option label="评分最高" value="rating" />
      </el-select>
    </div>

    <!-- 插件列表 -->
    <div class="plugin-list">
      <div v-for="plugin in sortedPlugins" :key="plugin.id" class="plugin-card">
        <!-- 插件图标 -->
        <div class="card-header">
          <el-tag v-if="plugin.isNew" class="new-tag">新品</el-tag>
        </div>

        <!-- 插件信息 -->
        <div class="card-body">
          <h3 class="plugin-name">{{ plugin.name }}</h3>
          <p class="plugin-desc">{{ plugin.description }}</p>

          <div class="plugin-meta">
            <div class="meta-item">
              <el-icon class="meta-icon"><UserFilled /></el-icon>
              <span class="meta-text">{{ plugin.author }}</span>
            </div>
            <div class="meta-item">
              <el-icon class="meta-icon"><StarFilled /></el-icon>
              <!-- <span class="meta-text">{{ plugin.rating.toFixed(1) }}⭐</span> -->
            </div>
            <div class="meta-item">
              <el-icon class="meta-icon"><DownloadFilled /></el-icon>
              <span class="meta-text">{{ formatDownloadCount(plugin.downloadCount) }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-footer">
          <el-button
            v-if="!isInstalled(plugin.id)"
            @click="installPlugin(plugin)"
            class="btn-install"
            :loading="installingPluginId === plugin.id"
          >
            <el-icon v-if="installingPluginId === plugin.id" class="btn-loading-icon">
              <Loading />
            </el-icon>
            安装
          </el-button>
          <el-button v-else type="success" class="btn-installed" disabled>
            <el-icon class="btn-icon"><CheckFilled /></el-icon>
            已安装
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="plugins.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无插件数据" class="empty-container" />
      </div>

      <!-- 加载中（修复核心报错点） -->
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-spinner">
          <Loading />
        </el-icon>
        <p class="loading-text">加载中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 导入所有用到的图标（补全缺失的图标）
import {
  UploadFilled,
  UserFilled,
  StarFilled,
  Loading
} from '@element-plus/icons-vue'
// 导入所有用到的组件（补全缺失的组件）
import { ElMessage, ElEmpty, ElTag, ElSelect, ElOption } from 'element-plus'
import {
  getInstalledPluginsAsync,
  installPluginsAsync,
  loadingUniquePluginsAsync,
} from '@/api/plugins'

const router = useRouter()

// 状态管理
const plugins = ref<any[]>([])
const installedPlugins = ref<string[]>([])
const searchKeyword = ref('')
const sortType = ref('latest')
const loading = ref(false)
const installingPluginId = ref('')

// 格式化下载量
const formatDownloadCount = (count: number) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return String(count)
}

// 安装插件
const installPlugin = async (plugin: any) => {
  try {
    installingPluginId.value = plugin.id
    const res = await installPluginsAsync({ pluginId: plugin.id })
    if (res.status) {
      installedPlugins.value.push(plugin.id)
      ElMessage.success(`插件《${plugin.name}》安装成功`)
      await getInstalledPluginsAsync()
    } else {
      ElMessage.warning('安装失败，请稍后重试')
    }
  } catch (error: any) {
    console.warn('安装失败:', error.message)
    ElMessage.error('安装出错，请检查网络连接')
  } finally {
    installingPluginId.value = ''
  }
}

// 检查是否已安装
const isInstalled = (id: string) => {
  return installedPlugins.value.includes(id)
}

// 排序处理
const sortedPlugins = computed(() => {
  let filtered = [...plugins.value]

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(keyword) ||
        plugin.author.toLowerCase().includes(keyword) ||
        (plugin.description && plugin.description.toLowerCase().includes(keyword)),
    )
  }

  // 排序
  switch (sortType.value) {
    case 'downloads':
      return filtered.sort((a, b) => b.downloadCount - a.downloadCount)
    case 'rating':
      return filtered.sort((a, b) => b.rating - a.rating)
    case 'latest':
    default:
      return filtered.sort(
        (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
      )
  }
})

// 排序变更
const handleSortChange = () => {
  // 排序逻辑已在computed中处理
}

// 初始化加载
onMounted(async () => {
  try {
    loading.value = true
    // 获取已安装插件
    const installedRes = await getInstalledPluginsAsync()
    if (installedRes.status && installedRes.data) {
      installedPlugins.value = installedRes.data.map((p: any) => p.id)
    }

    // 获取插件列表
    const pluginsRes = await loadingUniquePluginsAsync({ status: 'published' })
    if (pluginsRes.status) {
      plugins.value = pluginsRes.data.map((plugin: any) => ({
        ...plugin,
        // 标记新品（假设创建时间在30天内为新品）
        isNew: plugin.createTime
          ? new Date().getTime() - new Date(plugin.createTime).getTime() < 30 * 24 * 60 * 60 * 1000
          : false,
      }))
    }
  } catch (error: any) {
    console.warn('获取插件列表失败', error.message)
    ElMessage.error('获取插件数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
// 全局变量
$primary-color: #4263eb;
$primary-light: #e8f0fe;
$success-color: #00b42a;
$text-primary: #1d2129;
$text-secondary: #4e5969;
$text-tertiary: #86909c;
$border-color: #e5e6eb;
$bg-primary: #ffffff;
$bg-secondary: #f7f8fa;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$transition-default: all 0.25s ease-in-out;

// 页面容器
.plugin-market {
  padding: 0px 20px;
  background-color: $bg-secondary;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 头部区域
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-color;

  .header-left {
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;

      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 24px;
        background-color: $primary-color;
        border-radius: 2px;
        margin-right: 12px;
      }
    }

    .header-subtitle {
      font-size: 14px;
      color: $text-tertiary;
      margin: 0;
      padding-left: 16px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;

    .btn-icon {
      margin-right: 6px;
      font-size: 16px;
    }

    .btn-upload {
      background-color: $primary-color;
      border-color: $primary-color;
      padding: 8px 16px;
      border-radius: $radius-sm;
      font-size: 14px;
      font-weight: 500;
      transition: $transition-default;

      &:hover {
        background-color: #3351d8;
        border-color: #3351d8;
        box-shadow: 0 2px 8px rgba(66, 99, 235, 0.3);
      }
    }

    .btn-review {
      color: $primary-color;
      border-color: $primary-color;
      padding: 8px 16px;
      border-radius: $radius-sm;
      font-size: 14px;
      font-weight: 500;
      transition: $transition-default;

      &:hover {
        background-color: $primary-light;
        box-shadow: 0 2px 8px rgba(66, 99, 235, 0.15);
      }
    }
  }
}

// 筛选栏
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;

  .search-input {
    flex: 1;
    max-width: 500px;
    height: 40px;
    border-radius: $radius-sm;
    border-color: $border-color;
    font-size: 14px;

    &:focus-within {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(66, 99, 235, 0.15);
    }
  }

  .sort-select {
    width: 160px;
    height: 40px;
    border-radius: $radius-sm;
    border-color: $border-color;
    font-size: 14px;

    &:focus-within {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(66, 99, 235, 0.15);
    }
  }
}

// 插件列表
.plugin-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;

  .empty-state,
  .loading-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
    color: $text-tertiary;

    .loading-spinner {
      font-size: 48px;
      margin-bottom: 16px;
      color: $primary-color;
      animation: spin 1s linear infinite; // 给加载图标加旋转动画
    }

    .loading-text {
      font-size: 16px;
    }
  }
}

// 插件卡片
.plugin-card {
  background-color: $bg-primary;
  border-radius: $radius-lg;
  border: 1px solid $border-color;
  overflow: hidden;
  transition: $transition-default;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    border-color: $primary-light;
    box-shadow: $shadow-md;
  }

  // 卡片头部
  .card-header {
    padding: 20px 20px 12px;
    position: relative;

    .plugin-icon-container {
      width: 64px;
      height: 64px;
      border-radius: $radius-md;
      background-color: $primary-light;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      .plugin-icon {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }
    }

    .new-tag {
      position: absolute;
      top: 20px;
      right: 20px;
      background-color: $primary-color;
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
    }
  }

  // 卡片主体
  .card-body {
    padding: 0 20px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .plugin-name {
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 8px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .plugin-desc {
      font-size: 14px;
      color: $text-secondary;
      line-height: 1.6;
      margin: 0 0 16px 0;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .plugin-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: auto;

      .meta-item {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: $text-tertiary;

        .meta-icon {
          font-size: 14px;
          margin-right: 4px;
          color: $primary-color;
        }

        .meta-text {
          white-space: nowrap;
        }
      }
    }
  }

  // 卡片底部
  .card-footer {
    padding: 0 20px 20px;

    .btn-install {
      width: 100%;
      height: 40px;
      background-color: $primary-color;
      border-color: $primary-color;
      border-radius: $radius-sm;
      font-size: 14px;
      font-weight: 500;
      transition: $transition-default;

      &:hover {
        background-color: #3351d8;
        border-color: #3351d8;
      }

      .btn-loading-icon {
        margin-right: 6px;
        animation: spin 1s linear infinite;
      }
    }

    .btn-installed {
      width: 100%;
      height: 40px;
      background-color: #f0f9f2;
      border-color: #00b42a;
      color: #00b42a;
      border-radius: $radius-sm;
      font-size: 14px;
      font-weight: 500;

      .btn-icon {
        margin-right: 6px;
      }
    }
  }
}

// 加载动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .plugin-market {
    padding: 20px 16px;
  }

  .market-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;

    .search-input,
    .sort-select {
      width: 100%;
      max-width: none;
    }
  }

  .plugin-list {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>