<template>
  <div class="plugin-admin-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">🔍 插件审核中心</h2>
        <p class="page-desc">审核待处理的插件，通过后将在插件市场上线</p>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="refreshPendingPlugins"
          :loading="isRefreshing"
          class="refresh-btn"
        >
          <el-icon v-if="isRefreshing" class="loading-icon"><Loading /></el-icon>
          <el-icon v-else class="refresh-icon"><Refresh /></el-icon>
          刷新列表
        </el-button>
      </div>
    </div>

    <!-- 审核列表区域 -->
    <div class="review-list">
      <!-- 加载状态（修复报错核心点） -->
      <div v-if="loading" class="loading-state">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p class="loading-text">加载待审核插件中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="pendingPlugins.length === 0" class="empty-state">
        <el-empty description="暂无待审核的插件" class="empty-container" />
        <p class="empty-hint">当开发者上传插件后，会在这里显示待审核列表</p>
      </div>

      <!-- 插件审核卡片 -->
      <div v-else v-for="plugin in pendingPlugins" :key="plugin.id" class="review-card">
        <!-- 卡片头部：基础信息 -->
        <div class="card-header">
          <div class="plugin-basic">
            <h3 class="plugin-name">
              {{ plugin.name }}
              <span class="plugin-version">v{{ plugin.version }}</span>
            </h3>
            <div class="plugin-meta">
              <div class="meta-item">
                <el-icon class="meta-icon"><User /></el-icon>
                <span>作者: {{ plugin.author }}</span>
              </div>
              <div class="meta-item">
                <el-icon class="meta-icon"><Clock /></el-icon>
                <span>提交时间: {{ formatTime(plugin.createTime) }}</span>
              </div>
              <div class="meta-item" v-if="plugin.tags">
                <el-icon class="meta-icon"><Tag /></el-icon>
                <span>标签: {{ formatTags(plugin.tags) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 卡片主体：详情信息 -->
        <div class="card-body">
          <el-collapse-transition>
            <div v-show="expandedPluginId === plugin.id" class="plugin-detail">
              <h4 class="detail-title">插件描述</h4>
              <p class="plugin-desc">{{ plugin.description || '无描述信息' }}</p>

              <div class="plugin-attachments" v-if="plugin.fileName">
                <h4 class="detail-title">上传文件</h4>
                <el-tag type="info" class="file-tag">{{ plugin.fileName }}</el-tag>
              </div>
            </div>
          </el-collapse-transition>

          <button class="toggle-detail-btn" @click="togglePluginDetail(plugin.id)">
            <span>{{ expandedPluginId === plugin.id ? '收起详情' : '查看详情' }}</span>
            <el-icon class="toggle-icon">
              <ChevronDown v-if="expandedPluginId !== plugin.id" />
              <ChevronUp v-else />
            </el-icon>
          </button>
        </div>

        <!-- 卡片底部：操作区域 -->
        <div class="card-footer">
          <el-button
            type="success"
            class="approve-btn"
            @click="approvePlugin(plugin.id)"
            :loading="operatingPluginId === plugin.id"
          >
            <el-icon v-if="operatingPluginId === plugin.id" class="btn-loading-icon"
              ><Loading
            /></el-icon>
            审核通过
          </el-button>
          <el-button
            type="danger"
            class="reject-btn"
            @click="rejectPlugin(plugin.id)"
            :loading="operatingPluginId === plugin.id"
          >
            <el-icon v-if="operatingPluginId === plugin.id" class="btn-loading-icon"
              ><Loading
            /></el-icon>
            拒绝上线
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElEmpty, ElTag, ElButton, ElIcon } from 'element-plus'
// 导入所有需要的图标（确保无遗漏）
import { Refresh, User, Clock, Loading } from '@element-plus/icons-vue'
import { approvePluginAsync, loadingUniquePluginsAsync, rejectPluginAsync } from '@/api/plugins'

// 状态管理
const pendingPlugins = ref<any[]>([])
const loading = ref(false)
const isRefreshing = ref(false)
const operatingPluginId = ref('')
const expandedPluginId = ref('')

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return '未知时间'
  return new Date(timeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 格式化标签
const formatTags = (tags: string) => {
  if (!tags) return '无'
  return tags
    .split(',')
    .filter((tag) => tag.trim())
    .join('、')
}

// 切换插件详情展开/收起
const togglePluginDetail = (pluginId: string) => {
  expandedPluginId.value = expandedPluginId.value === pluginId ? '' : pluginId
}

// 获取待审核插件
const getPendingPlugins = async () => {
  loading.value = true
  try {
    const res = await loadingUniquePluginsAsync({ status: 'pending' })
    if (res.status) {
      pendingPlugins.value = res.data || []
    } else {
      ElMessage.warning('获取待审核列表失败')
    }
  } catch (error: any) {
    ElMessage.error('获取列表出错：' + error.message)
    console.warn('获取待审核插件失败:', error)
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 刷新列表
const refreshPendingPlugins = () => {
  isRefreshing.value = true
  getPendingPlugins()
}

// 审核通过
const approvePlugin = async (pluginId: string) => {
  operatingPluginId.value = pluginId
  try {
    const res = await approvePluginAsync({ pluginId })
    if (res.status) {
      ElMessage.success('审核通过！插件将在市场上线')
      getPendingPlugins() // 刷新列表
    } else {
      ElMessage.warning('审核通过失败：' + (res.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('操作失败：' + error.message)
    console.warn('审核通过失败:', error)
  } finally {
    operatingPluginId.value = ''
  }
}

// 拒绝审核
const rejectPlugin = async (pluginId: string) => {
  operatingPluginId.value = pluginId
  try {
    const res = await rejectPluginAsync({ pluginId })
    if (res.status) {
      ElMessage.success('已拒绝该插件')
      getPendingPlugins() // 刷新列表
    } else {
      ElMessage.warning('拒绝失败：' + (res.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('操作失败：' + error.message)
    console.warn('拒绝插件失败:', error)
  } finally {
    operatingPluginId.value = ''
  }
}

// 初始化加载
onMounted(() => {
  getPendingPlugins()
})
</script>

<style scoped lang="scss">
// 全局变量（与插件系统保持一致）
$primary-color: #4263eb;
$success-color: #00b42a;
$danger-color: #ff4d4f;
$text-primary: #1d2129;
$text-secondary: #4e5969;
$text-tertiary: #86909c;
$border-color: #e5e6eb;
$bg-primary: #ffffff;
$bg-secondary: #f7f8fa;
$radius-sm: 6px;
$radius-md: 8px;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
$transition-default: all 0.25s ease-in-out;

// 页面容器
.plugin-admin-container {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-color;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-desc {
      font-size: 14px;
      color: $text-tertiary;
      margin: 0;
    }
  }

  .header-actions {
    .refresh-btn {
      background-color: $primary-color;
      border-color: $primary-color;
      transition: $transition-default;

      .refresh-icon,
      .loading-icon {
        margin-right: 6px;
      }

      .loading-icon {
        animation: spin 1s linear infinite;
      }

      &:hover {
        background-color: #3351d8;
        border-color: #3351d8;
      }
    }
  }
}

// 审核列表
.review-list {
  background-color: $bg-primary;
  border-radius: $radius-md;
  border: 1px solid $border-color;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

// 加载状态（修复后）
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;

  .loading-icon {
    font-size: 48px;
    color: $primary-color;
    margin-bottom: 16px;
    animation: spin 1s linear infinite; // 核心旋转动画
  }

  .loading-text {
    font-size: 16px;
    color: $text-tertiary;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;

  .empty-container {
    margin-bottom: 16px;
  }

  .empty-hint {
    font-size: 14px;
    color: $text-tertiary;
    margin: 0;
  }
}

// 审核卡片
.review-card {
  padding: 24px;
  border-bottom: 1px solid $border-color;
  transition: $transition-default;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafbff;
  }

  // 卡片头部
  .card-header {
    .plugin-basic {
      .plugin-name {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .plugin-version {
        font-size: 14px;
        font-weight: 400;
        color: $text-tertiary;
        background-color: $bg-secondary;
        padding: 2px 8px;
        border-radius: 12px;
      }

      .plugin-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin: 0;

        .meta-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: $text-secondary;

          .meta-icon {
            font-size: 16px;
            margin-right: 6px;
            color: $primary-color;
          }
        }
      }
    }
  }

  // 卡片主体
  .card-body {
    margin: 16px 0;

    .plugin-detail {
      background-color: $bg-secondary;
      border-radius: $radius-sm;
      padding: 16px;
      margin-top: 12px;

      .detail-title {
        font-size: 14px;
        font-weight: 500;
        color: $text-primary;
        margin: 0 0 8px 0;
      }

      .plugin-desc {
        font-size: 14px;
        color: $text-secondary;
        line-height: 1.6;
        margin: 0 0 16px 0;
      }

      .plugin-attachments {
        .file-tag {
          margin-right: 8px;
        }
      }
    }

    .toggle-detail-btn {
      background: none;
      border: none;
      color: $primary-color;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;

      &:hover {
        color: #3351d8;
      }

      .toggle-icon {
        font-size: 14px;
        transition: transform 0.2s ease;
      }
    }
  }

  // 卡片底部（操作区）
  .card-footer {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    justify-content: flex-end;

    .approve-btn,
    .reject-btn {
      padding: 8px 24px;
      transition: $transition-default;

      .btn-loading-icon {
        margin-right: 6px;
        animation: spin 1s linear infinite;
      }
    }

    .approve-btn {
      background-color: $success-color;
      border-color: $success-color;

      &:hover {
        background-color: #009924;
        border-color: #009924;
      }
    }

    .reject-btn {
      background-color: $danger-color;
      border-color: $danger-color;

      &:hover {
        background-color: #d9363e;
        border-color: #d9363e;
      }
    }
  }
}

// 旋转动画（通用）
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .review-card {
    padding: 16px;

    .card-footer {
      flex-direction: column;
      gap: 8px;

      .approve-btn,
      .reject-btn {
        width: 100%;
      }
    }

    .plugin-meta {
      gap: 12px;
    }
  }
}
</style>
