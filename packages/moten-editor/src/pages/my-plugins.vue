<template>
  <div class="installed-plugins-page">
    <div class="page-header">
      <div class="header-title">
        <p class="subtitle">共 {{ plugins.length }} 个插件</p>
      </div>
      <el-button type="primary" size="small" @click="handleAddPlugin">
        <el-icon size="16"><Plus /></el-icon>
        添加新插件
      </el-button>
    </div>

    <div class="plugins-container">
      <div v-if="plugins.length === 0" class="empty-state">
        <el-empty description="暂无已安装的插件" />
        <el-button type="primary" style="margin-top: 16px" @click="handleAddPlugin">
          <Plus size="16" /> 添加插件
        </el-button>
      </div>

      <el-card class="plugin-card" v-for="(plugin, index) in plugins" :key="plugin.id" hover>
        <template #header>
          <div class="card-header">
            <img
              :src="plugin.icon"
              alt="插件图标"
              class="plugin-icon"
              :onerror="`this.src='https://picsum.photos/50/50?random=${index}'`"
            />
            <div class="header-info">
              <div class="name-status">
                <h3 class="plugin-name">{{ plugin.name }}</h3>
                <el-tag type="success" size="small" class="installed-tag">已安装</el-tag>
              </div>
              <div class="version-info">
                <span class="current-version">当前版本：v{{ plugin.version }}</span>
                <el-tag v-if="plugin.hasUpdate" type="warning" size="small" class="update-tag">
                  有更新 (v{{ plugin.latestVersion }})
                </el-tag>
              </div>
            </div>
          </div>
        </template>

        <div class="card-body">
          <div class="plugin-desc">
            {{ plugin.description }}
          </div>

          <div class="meta-info">
            <div class="meta-item">
              <el-icon size="14"><User /></el-icon>
              <span>{{ plugin.author }}</span>
            </div>
            <div class="meta-item">
              <el-icon size="14"><Calendar /></el-icon>
              <span>安装于 {{ formatDate(plugin.installedAt || plugin.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <el-icon size="14"><Download /></el-icon>
              <span>{{ plugin.downloadCount }} 次下载</span>
            </div>
          </div>

          <div class="plugin-tags">
            <el-tag v-for="tag in plugin.tags" :key="tag" type="info" size="small">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="card-actions">
          <el-button
            v-if="plugin.hasUpdate"
            type="warning"
            size="small"
            @click="handleUpdate(plugin)"
          >
            <el-icon size="14"><Refresh /></el-icon>
            更新
          </el-button>
          <el-button type="default" size="small" @click="handleManage(plugin)">
            <el-icon size="14"><Setting /></el-icon>
            管理
          </el-button>
          <el-button type="danger" size="small" @click="handleUninstall(plugin)">
            <el-icon size="14"><Delete /></el-icon>
            卸载
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getInstalledPluginsAsync } from '@/api/plugins'
import { onMounted, ref } from 'vue'
import { Plus, User, Calendar, Download, Refresh, Setting, Delete } from '@element-plus/icons-vue'
import { ElTag, ElButton, ElIcon, ElEmpty, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

// 扩展插件类型：增加已安装相关字段
interface InstalledPlugin {
  author: string
  createdAt: string // 创建时间
  installedAt?: string // 安装时间（已安装插件特有）
  description: string
  downloadCount: number
  filePath: string
  icon: string
  id: number
  name: string
  rating: number
  status: 'published' | 'draft' | 'deprecated'
  tags: string[]
  version: string // 当前安装版本
  hasUpdate?: boolean // 是否有更新（已安装插件特有）
  latestVersion?: string // 最新版本（如有更新）
  size?: number // 插件大小（MB，已安装插件特有）
}

const plugins = ref<InstalledPlugin[]>([])
const router = useRouter()

onMounted(async () => {
  const res = await getInstalledPluginsAsync()
  const { message, data } = res
  if (message === 'success') {
    // 模拟补充已安装插件的特有字段（实际项目中从接口获取）
    plugins.value = (data as InstalledPlugin[]).map((plugin) => ({
      ...plugin,
      installedAt: plugin.createdAt, // 实际项目中替换为真实安装时间
      hasUpdate: Math.random() > 0.7, // 随机模拟是否有更新
      latestVersion: Math.random() > 0.7 ? '2.2.0' : undefined, // 模拟最新版本
      size: (Math.random() * 10 + 0.5).toFixed(1) as unknown as number, // 模拟大小
    }))
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 操作函数
const handleAddPlugin = () => {
  // 跳转到插件市场/添加页面
  router.push('/plugins')
}

const handleUpdate = (plugin: InstalledPlugin) => {
  ElMessageBox.confirm(
    `确定要将 ${plugin.name} 从 v${plugin.version} 更新到 v${plugin.latestVersion} 吗？`,
    '更新插件',
    {
      confirmButtonText: '确认更新',
      cancelButtonText: '取消',
      type: 'info',
    },
  ).then(() => {
    console.log(`更新插件：${plugin.id}`)
  })
}

const handleManage = (plugin: InstalledPlugin) => {
  // 跳转到插件详情/管理页面
  console.log(`管理插件：${plugin.id}`)
}

const handleUninstall = (plugin: InstalledPlugin) => {
  ElMessageBox.confirm(`确定要卸载 ${plugin.name} 吗？卸载后插件数据可能会丢失。`, '卸载插件', {
    confirmButtonText: '确认卸载',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 实际项目中调用卸载接口
    plugins.value = plugins.value.filter((p) => p.id !== plugin.id)
  })
}
</script>

<style scoped lang="scss">
.installed-plugins-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .header-title {
    h1 {
      margin: 0 0 8px 0;
      font-size: 22px;
      color: #333;
    }
    .subtitle {
      margin: -20px 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.plugins-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  .empty-state {
    width: 100%;
    padding: 40px 0;
    text-align: center;
  }
}

.plugin-card {
  flex: 1;
  min-width: 280px;
  max-width: calc(33.333% - 16px);
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;

  .plugin-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
    background: #f5f5f5;
  }

  .header-info {
    flex: 1;

    .name-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .plugin-name {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .installed-tag {
        background: #f0f9eb;
        color: #52c41a;
        border-color: #b7eb8f;
      }
    }

    .version-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;

      .update-tag {
        margin-top: 1px;
        cursor: pointer;
      }
    }
  }
}

.card-body {
  padding: 16px 0 12px;

  .plugin-desc {
    color: #666;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed #f0f0f0;
  }

  .meta-info {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #888;

      el-icon {
        color: #aaa;
      }
    }
  }

  .plugin-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 8px;
  border-top: 1px solid #f5f5f5;

  el-button {
    padding: 4px 12px;
  }
}

// 响应式调整
@media (max-width: 1024px) {
  .plugin-card {
    max-width: calc(50% - 12px);
  }
}

@media (max-width: 768px) {
  .plugin-card {
    max-width: 100%;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-title h1 {
      font-size: 18px;
    }
  }

  .card-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
