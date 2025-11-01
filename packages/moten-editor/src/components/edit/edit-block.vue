<template>
  <div class="edit-block">
    <div class="left">
      <div
        class="menu-item"
        v-for="(item, index) in menuList"
        :key="index"
        :class="{ 'is-active': index === activeMenu }"
        @click="activeMenu = index"
      >
        <v-icon class="menu-icon" :icon="index === activeMenu ? item.iconActive : item.icon">
        </v-icon>
        <div class="menu-name">{{ item.name }}</div>
      </div>
    </div>
    <div class="right" v-if="activeMenu === 0">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="基础组件" name="1">
          <InteractEditBlockDrag
            :list="baseBlockList"
          ></InteractEditBlockDrag>
        </el-collapse-item>
        <el-collapse-item title="高级组件" name="2">
          <InteractEditBlockDrag
            :list="seniorBlockList"
          ></InteractEditBlockDrag>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="right" v-else-if="activeMenu === 1">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="基础交互组件" name="1">
          <InteractEditBlockDrag
            :list="canvasBlockList"
          ></InteractEditBlockDrag>
        </el-collapse-item>
      </el-collapse>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="数据展示类组件" name="2">
          <InteractEditBlockDrag
            :list="showDataBlockList"
          ></InteractEditBlockDrag>
        </el-collapse-item>
      </el-collapse>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="布局与容器组件" name="3">
          <InteractEditBlockDrag
            :list="containerBlockList"
          ></InteractEditBlockDrag>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="right" v-else-if="activeMenu === 2">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="自定义插件" name="1" v-if="componentPalette.length > 0">
          <InteractEditBlockDrag
            :list="componentPalette"
          ></InteractEditBlockDrag>
        </el-collapse-item>

        <el-collapse-item title="自定义插件" name="1" v-else>
          <div class="plugin-empty-state">
            <div class="empty-text">
              <h3 class="empty-title">暂无已下载插件</h3>
              <p class="empty-description">从插件市场获取更多功能组件，丰富你的编辑体验</p>
            </div>

            <div class="empty-actions">
              <el-button type="primary" @click="openPluginMarket">
                <el-icon><ShoppingCart /></el-icon>
                浏览插件市场
              </el-button>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="right" v-else-if="activeMenu === 3">
      <div class="history-panel-narrow">
        <!-- 头部信息 -->
        <div class="history-header-narrow">
          <h3>操作历史记录</h3>
          <div class="history-stats-narrow">
            <span>总记录: {{ historyRecords.length }}</span>
            <span>当前版本: {{ latestVersion }}</span>
          </div>
        </div>
        <el-input v-model="historyIntroduction"> </el-input>
        <el-button type="primary" style="width: 100%; margin: 10px 0px" @click="updateHistory">
          上传操作
        </el-button>

        <!-- 时间线列表 -->
        <el-timeline class="history-timeline-narrow" reverse v-if="historyRecords.length">
          <el-timeline-item
            v-for="history in historyRecords"
            :key="history.id"
            :timestamp="formatTime(history.timestamp)"
            :color="getOperationColor(history.operation)"
            :icon="getOperationIcon(history.operation)"
          >
            <el-card class="history-card-narrow">
              <div class="history-content-narrow">
                <!-- 操作基本信息 -->
                <div class="history-info-top">
                  <span class="operation-badge-narrow" :class="`operation-${history.operation}`">
                    {{ formatOperationType(history.operation) }}
                  </span>
                  <div class="version-user-narrow">
                    <span class="version-info-narrow">概述：{{ history.introduction }}</span>
                    <span class="version-info-narrow">版本 {{ history.version }}</span>
                    <span class="user-id-narrow">作者: {{ shortenUserId(history.userId) }}</span>
                  </div>
                </div>

                <div class="history-actions" style="display: flex; flex-direction: column">
                  <el-button size="mini" text @click="openJsonDetail(history)" icon="InfoFilled">
                    详情
                  </el-button>
                  <el-button size="mini" text @click="handleRevert(history)" icon="RefreshRight">
                    恢复
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div v-else class="history-empty-narrow">
          <el-empty description="暂无操作历史"></el-empty>
        </div>
      </div>
    </div>
    <div class="right" v-else-if="activeMenu === 4">
      <mo-canvas></mo-canvas>
    </div>
  </div>
  <el-dialog
    v-model="jsonDialogVisible"
    title="操作详情JSON数据"
    width="70%"
    :before-close="() => (jsonDialogVisible = false)"
  >
    <div class="json-preview-container">
      <pre class="formatted-json">
          {{ formatJson(currentJsonData) }}
        </pre
      >
      <div class="json-actions">
        <el-button size="mini" type="text" @click="copyJson" icon="CopyDocument">
          复制JSON
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  baseBlock as baseBlocks,
  seniorBlocks,
  basicBlock,
  showDataBlock,
  containerBlock,
} from '@/config/block'
import { getInstalledPluginsAsync } from '@/api/plugins'
import pluginManager from '@/utils/pluginManager'
import { useRouter } from 'vue-router'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditStore } from '@/stores/edit'
import { ElMessage } from 'element-plus'
import MoCanvas from '../canvas/index.vue'
import InteractEditBlockDrag from './InteractEditBlockDrag.vue'

const menuList = ref([
  {
    icon: 'block',
    iconActive: 'blockActive',
    name: '组件',
  },
  {
    icon: 'kit',
    iconActive: 'kitActive',
    name: '套件',
  },
  {
    icon: 'plugin',
    iconActive: 'pluginActive',
    name: '插件',
  },
  {
    icon: 'history',
    iconActive: 'history',
    name: '历史',
  },
  {
    icon: 'canvas',
    iconActive: 'canvas',
    name: '画板',
  },
])
const activeMenu = ref(0)
const activeNames = ref(['1', '2', '3'])
const router = useRouter()
const jsonDialogVisible = ref(false)
const baseBlockList = ref(baseBlocks)
const seniorBlockList = ref(seniorBlocks)
const canvasBlockList = ref(basicBlock)
const showDataBlockList = ref(showDataBlock)
const containerBlockList = ref(containerBlock)
const collabStore = useCollaborationStore()
const edit = useEditStore()
const historyRecords = ref<any>([])
const componentPalette = ref<any[]>([])
const currentJsonData = ref<any>(null)
const historyIntroduction = ref('')

const formatJson = (data: any) => {
  try {
    return JSON.stringify(data, null, 2).replace(/\n\s+/g, (match) => {
      const spaces = match.replace('\n', '')
      return '\n' + spaces.substring(2) // 去掉数组的额外缩进
    })
  } catch (e) {
    return '无效的JSON数据'
  }
}
const openJsonDetail = (history: any) => {
  currentJsonData.value = history.payload
  jsonDialogVisible.value = true
}
const openPluginMarket = () => {
  router.push('/plugins')
}
const copyJson = () => {
  try {
    navigator.clipboard.writeText(formatJson(currentJsonData.value))
    ElMessage.success('JSON已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}
const latestVersion = computed(() => {
  if (historyRecords.value.length === 0) return 0
  return Math.max(...historyRecords.value.map((h: any) => h.version))
})
const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
const handleRevert = (history: any) => {
  // TOOD 历史版本回退
  edit.blockConfig = history.payload
}
const shortenUserId = (userId: string) => {
  if (!userId) return
  if (userId.length <= 8) return userId
  return userId.substring(0, 6) + '...' + userId.substring(userId.length - 4)
}
const formatOperationType = (operation: any) => {
  const operationMap = {
    block_config_update: '区块配置更新',
    create: '创建',
    delete: '删除',
    move: '移动',
    // 可以添加更多操作类型映射
  } as any
  return operationMap[operation] || operation
}
const getOperationColor = (operation: any) => {
  const colorMap = {
    block_config_update: '#1890ff',
    create: '#52c41a',
    delete: '#ff4d4f',
    move: '#faad14',
  } as any
  return colorMap[operation] || '#8c8c8c'
}
const getOperationIcon = (operation: any) => {
  const iconMap = {
    block_config_update: 'Edit',
    create: 'Plus',
    delete: 'Delete',
    move: 'RefreshLeft',
  } as any
  return iconMap[operation] || 'InfoFilled'
}
const updateHistory = async () => {
  const blockConfig = edit.blockConfig
  await collabStore.sendHistoryUpdata(blockConfig, historyIntroduction.value)
  await loadHistoryRecords()
}
async function loadInstallPlugins() {
  try {
    const res = await getInstalledPluginsAsync()
    const _list = res.data
    const loadPromises = _list.map(async (plugin: any) => {
      const zipFilename = plugin.filePath.split('/').pop()
      const zipUrl = `http://localhost:8081/uploads/plugins/${zipFilename}`
      await pluginManager.loadPlugin(plugin.id.toString(), zipUrl)
    })
    await Promise.all(loadPromises)
    updateComponentPalette()
  } catch (error) {
    console.error('加载插件失败', error)
  }
}
const loadHistoryRecords = async () => {
  await collabStore.fetchHistory()
  historyRecords.value = collabStore.historyRecords
}
function updateComponentPalette() {
  const pluginMetas = pluginManager.getPluginMetas()
  componentPalette.value = pluginMetas.map((meta) => {
    const formData: Record<string, any> = {}
    meta.props.forEach((prop: any) => {
      formData[prop.name] = {
        desktop: prop.default,
        mobile: prop.default,
      }
    })
    return {
      id: meta.id,
      name: meta.name,
      icon: meta.icon || '📦',
      code: meta.id,
      type: meta.id,
      formData,
    }
  })
}

onMounted(() => {
  loadInstallPlugins()
})
</script>

<style scoped lang="scss">
/* 整体面板：缩小内边距、调整字体 */
.history-panel-narrow {
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  font-size: 12px;
}

/* 头部：紧凑排列 */
.history-header-narrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.history-header-narrow h3 {
  font-size: 14px;
  margin: 0;
}
.history-stats-narrow {
  font-size: 11px;
  color: #666;
}
.history-stats-narrow span {
  margin-left: 8px;
}

/* 时间线：缩小间距 */
.history-timeline-narrow {
  margin: 0;
  padding-left: 15px;
}

/* 卡片：减小内边距，hover微效果 */
.history-card-narrow {
  width: 100%;
  margin-bottom: 8px;
  padding: 8px;
  transition: box-shadow 0.2s ease;
}
.history-card-narrow:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 内容区：垂直分布，缩小间距 */
.history-content-narrow {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 操作类型徽章：缩小尺寸 */
.operation-badge-narrow {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}
/* 不同操作类型的颜色区分 */
.operation-block_config_update {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 版本+用户：右侧垂直排列 */
.version-user-narrow {
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.version-info-narrow {
  font-size: 11px;
  color: #8c8c8c;
  background-color: #f5f5f5;
  margin-right: 10px;
  padding: 1px 6px;
  // border-radius: 10px;
}
.user-info-narrow {
  display: flex;
  align-items: center;
  gap: 4px;
}
.user-avatar-narrow {
  background-color: #f0f2f5;
  color: #666;
}
.user-id-narrow {
  font-size: 11px;
  background-color: #f5f5f5;
  color: #666;
}

/* 详情区域：紧凑展开 */
.history-details-narrow {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.history-data-details-narrow {
  flex: 1;
  cursor: pointer;
  color: #4e5969;
  font-size: 11px;
}
.details-summary-narrow {
  outline: none;
}
.formatted-json {
  /* 核心：自动显示滚动条 */
  overflow-x: auto;
  overflow-y: auto;

  /* 格式保留：确保JSON结构不被破坏 */
  white-space: pre;
  font-family: 'Consolas', 'Monaco', 'Menlo', monospace; /* 等宽字体，对齐更整齐 */
  font-size: 12px;
  line-height: 1.6;

  /* 视觉优化 */
  padding: 10px 12px;
  margin: 8px 0;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #374151;

  /* 移除无效的宽度设置（改为自适应父容器） */
  width: auto !important;
  max-width: 100%;
}

/* 语法高亮（可选，提升可读性） */
.formatted-json .json-key {
  color: #2563eb;
  font-weight: 500;
}
.formatted-json .json-string {
  color: #10b981;
}
.formatted-json .json-number {
  color: #f59e0b;
}
.formatted-json .json-boolean {
  color: #8b5cf6;
}
.formatted-json .json-null {
  color: #6b7280;
}

/* 恢复按钮：缩小尺寸 */
.revert-btn-narrow {
  padding: 0;
  margin-left: 8px;
  font-size: 11px;
}

/* 空状态：简化显示 */
.history-empty-narrow {
  margin: 20px 0;
  text-align: center;
}
.plugin-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
  border-radius: 8px;
  margin: 10px;
  transition: all 0.3s ease;
}

.plugin-empty-state:hover {
  background-color: #f5f5f5;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #666;
  max-width: 300px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.empty-actions {
  margin-top: 10px;
}
.edit-block {
  position: fixed;
  top: var(--edit-header-height);
  left: 0;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-start;
  width: var(--edit-block-width);

  .left {
    width: 70px;
    height: calc(100vh - var(--edit-header-height));
    border-right: 1px solid var(--color-border);

    .menu-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      padding: 5.5px 0;
      border-radius: var(--border-radius);
      cursor: pointer;
      margin: 17px 5px;

      &.is-active,
      &:hover {
        background: var(--color-block-hover);
        border-radius: var(--border-radius);
      }

      .menu-icon {
        width: 30px;
        height: 30px;
        margin: 0 auto;
      }

      .menu-name {
        font-size: 14px;
        line-height: 14px;
        padding-top: 4px;
      }
    }
  }

  .right {
    flex: 1;
    height: calc(100vh - var(--edit-header-height));
    overflow: auto;
  }

  :deep(.el-collapse) {
    border: 0;
  }

  :deep(.el-collapse-item__header) {
    padding-left: 14px;
    font-size: 14px;
  }

  :deep(.el-collapse-item__content) {
    padding-left: 14px;
    padding-right: 14px;
    padding-bottom: 14px;
  }
}
:deep(.canvas-wrapper) {
  position: static !important; // 取消绝对定位，跟随父容器
  width: 100% !important;
  height: 100% !important;
  border-radius: 0; // 与父容器圆角统一
  box-shadow: none; // 消除多余阴影
}

:deep(.drawing-canvas) {
  border: none; // 取消画布自身边框
}

:deep(.toolbar) {
  position: static !important; // 工具栏改为静态定位
  width: 100%;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  border-radius: 0;
  box-shadow: none;
  padding: 8px 16px;
  margin: 0;
  gap: 16px;
}
</style>
