<template>
  <div class="main-container">
    <!-- 左侧树状导航栏 -->
    <div class="left-container">
      <div class="sidebar-header">
        <el-icon class="sidebar-logo"><Layout /></el-icon>
        <h3 class="sidebar-title">huuyii</h3>
      </div>

      <el-tree
        class="custom-tree"
        :data="treeData"
        :props="treeProps"
        :expand-on-click-node="true"
        :default-expanded-keys="['project-root']"
        :default-selected-keys="['my-pages']"
        @node-click="handleTreeNodeClick"
        ref="treeRef"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content">
            <el-icon class="node-icon" :color="data.color || '#64748b'">
              <component :is="data.icon" />
            </el-icon>
            <span class="node-label" v-if="!isSidebarCollapsed">{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 右侧内容区域 -->
    <div class="page-list-container">
      <!-- 顶部操作栏 -->
      <div class="page-list-header">
        <h1 class="page-title">{{ currentTitle }}</h1>
        <div class="header-actions">
          <button class="figma-btn secondary" @click="hanleMarket">
            <el-icon :size="16"><Shop /></el-icon>
            插件市场
          </button>
          <button
            class="figma-btn primary"
            @click="handleCreateNew"
            v-if="currentSelectedKey === 'my-pages'"
          >
            <el-icon :size="16"><Plus /></el-icon>
            新建页面
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated :style="{ '--el-skeleton-bg': '#f3f4f6' }" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="pages.length === 0 && currentSelectedKey === 'my-pages'" class="empty-state">
        <div class="empty-icon">🖌️</div>
        <h3>暂无设计页面</h3>
        <p>创建你的第一个低代码设计页面，开启创作之旅</p>
        <button class="figma-btn primary" @click="handleCreateNew">立即创建</button>
      </div>

      <!-- 页面列表（默认展示） -->
      <div v-else-if="currentSelectedKey === 'my-pages'" class="page-grid">
        <div v-for="page in pages" :key="page.id" class="page-card">
          <!-- 缩略图区域 -->
          <div class="card-thumbnail" @click="handlePreview(page.page_id)">
            <img
              v-if="page.coverImage"
              :src="`http://localhost:8081${page.coverImage}`"
              :alt="page.name"
              class="thumbnail-img"
            />
            <div v-else class="placeholder-thumbnail">
              <el-icon :size="48" color="#94a3b8">
                <Picture />
              </el-icon>
            </div>
            <div class="thumbnail-overlay">
              <span class="preview-text">预览</span>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="card-content">
            <h3 class="card-title" @click="handlePreview(page.page_id)">
              {{ page.name }}
            </h3>
            <p v-if="page.description" class="card-desc">
              {{ page.description }}
            </p>
            <p v-else class="card-desc placeholder-desc">无描述</p>
            <div class="card-meta-group">
              <p class="card-meta">
                <el-icon :size="14" color="#94a3b8"><Clock /></el-icon>
                创建于 {{ formatDate(page.create_time) }}
              </p>
              <p class="card-meta">
                <el-icon :size="14" color="#94a3b8"><EditPen /></el-icon>
                更新于 {{ formatDate(page.update_time) }}
              </p>
            </div>
          </div>

          <!-- 操作区域 -->
          <div class="card-actions">
            <button class="figma-btn icon-btn" @click="handleExport" title="导出PDF">
              <el-icon :size="16"><Document /></el-icon>
            </button>
            <button class="figma-btn text-btn" @click="handleEdit(page.page_id)">
              <el-icon :size="14" class="btn-icon"><Edit /></el-icon>
              编辑
            </button>
            <button class="figma-btn text-btn danger" @click="handleDelete(page.page_id)">
              <el-icon :size="14" class="btn-icon"><Delete /></el-icon>
              删除
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="currentSelectedKey === 'plugin-market'">
        <plugin-market></plugin-market>
      </div>
      <!-- 其他节点内容占位（可扩展） -->
      <div v-else class="other-node-content">
        <div class="node-placeholder">
          <el-icon :size="64" color="#cbd5e1"><component :is="currentNodeIcon" /></el-icon>
          <h3 class="placeholder-title">{{ currentTitle }}</h3>
          <p class="placeholder-desc">点击左侧导航栏展开更多功能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElTree, ElSkeleton } from 'element-plus'
import pluginMarket from './pluginMarket.vue'
// 补充导入 File 图标（之前缺失导致初始化异常）
import {
  Shop,
  Plus,
  Picture,
  Clock,
  EditPen,
  Edit,
  Delete,
  Document,
  Folder,
  Star,
  TakeawayBox,
  Setting,
  DeleteFilled,
  User,
  Files, // 关键修复：导入 Files 图标
} from '@element-plus/icons-vue'
import { deletePageAcync, getPageAsync } from '@/api/page'
import { useUserStore } from '@/stores/user'
import { useEditStore } from '@/stores/edit'
import { exportToPdf } from '@/utils/exportPdf'

// 路由
const router = useRouter()
const userStore = useUserStore()
const editStore = useEditStore()

// 状态管理
const pages = ref<any>([])
const loading = ref(true)
const treeRef = ref<any>(null)
const isSidebarCollapsed = ref(false)
const currentSelectedKey = ref('my-pages')
const currentTitle = ref('我的页面')
const currentNodeIcon = ref(Files) // 现在 Files 图标已导入，无异常

// 树状导航数据
const treeData = ref([
  {
    id: 'project-root',
    label: '项目管理',
    icon: Folder,
    color: '#4263eb',
    children: [
      {
        id: 'my-pages',
        label: '我的页面',
        icon: Files,
        color: '#3b82f6',
      },
      {
        id: 'component-lib',
        label: '组件库',
        icon: TakeawayBox,
        color: '#10b981',
      },
      {
        id: 'favorite',
        label: '收藏夹',
        icon: Star,
        color: '#f59e0b',
      },
    ],
  },
  {
    id: 'plugin-root',
    label: '插件管理',
    icon: Shop,
    color: '#8b5cf6',
    children: [
      {
        id: 'plugin-market',
        label: '插件市场',
        icon: Shop,
        color: '#8b5cf6',
      },
      {
        id: 'my-plugins',
        label: '已安装插件',
        icon: Star,
        color: '#ec4899',
      },
    ],
  },
  {
    id: 'system-root',
    label: '系统设置',
    icon: Setting,
    color: '#64748b',
    children: [
      {
        id: 'recycle-bin',
        label: '回收站',
        icon: DeleteFilled,
        color: '#ef4444',
      },
      {
        id: 'account-setting',
        label: '账户设置',
        icon: User,
        color: '#64748b',
      },
    ],
  },
])

// 树状图配置
const treeProps = ref({
  label: 'label',
  children: 'children',
  icon: 'icon',
})

// 格式化日期
const formatDate = (dateString: any) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 切换侧边栏折叠/展开（模板中已移除按钮，保留方法供后续扩展）
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 树节点点击事件
const handleTreeNodeClick = (data: any, node: any) => {
  currentSelectedKey.value = data.id
  currentTitle.value = data.label
  currentNodeIcon.value = data.icon

  // 节点跳转逻辑：只处理子节点，父节点仅展开不跳转
  switch (data.id) {
    case 'my-pages':
      loadPages() // 刷新页面列表
      break
    case 'recycle-bin':
      // 回收站功能可后续扩展
      break
    default:
      // 父节点（如项目管理）点击仅展开，不做额外操作
      break
  }
}

// 加载页面列表
const loadPages = () => {
  try {
    loading.value = true
    pages.value = userStore.list
  } catch (error) {
    console.error('加载页面列表失败:', error)
    ElMessage.error('加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 导出PDF
const handleExport = () => {
  exportToPdf('.export_render', {
    filename: 'test.pdf',
    margin: 15,
    jsPDF: { orientation: 'landscape' },
  })
}

// 创建新页面
const handleCreateNew = () => {
  router.push('/edit')
}

// 跳转到插件市场
const hanleMarket = () => {
  router.push('/plugins')
}

// 编辑页面
const handleEdit = (pageId: string) => {
  const selectedPage = userStore.list.find((l: any) => l.page_id === pageId) as any
  editStore.setEdit(true)
  editStore.setPageConfig({
    title: {
      desktop: selectedPage.name,
      mobile: selectedPage.name,
    },
    cover: {
      desktop: selectedPage.coverImage,
      mobile: selectedPage.coverImage,
    },
    description: {
      desktop: selectedPage.description,
      mobile: selectedPage.description,
    },
  } as any)
  router.push(`/edit/${pageId}`)
}

// 预览页面
const handlePreview = (pageId: string) => {
  router.push(`/preview/${pageId}`)
}

// 删除页面
const handleDelete = async (pageId: string) => {
  const params = { id: pageId }
  try {
    const { code, data, message } = await deletePageAcync(params)
    if (code === 200) {
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
      const { code, data, message } = await getPageAsync()
      userStore.setList(data)
      loadPages()
    } else {
      ElMessage({
        type: 'error',
        message: '删除失败' + message,
      })
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '运行错误' + error,
    })
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  const { code, data, message } = await getPageAsync()
  if (code === 200) {
    userStore.setList(data)
  } else {
    console.warn(message)
  }
  loadPages()
})
</script>

<style scoped lang="scss">
// 全局设计变量（保持系统统一）
$primary-color: #4263eb;
$primary-hover: #3351d8;
$text-primary: #1d2129;
$text-secondary: #4e5969;
$text-tertiary: #86909c;
$border-color: #e5e6eb;
$bg-primary: #ffffff;
$bg-secondary: #f7f8fa;
$bg-sidebar: #f8fafc;
$radius-sm: 6px;
$radius-md: 8px;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
$transition-default: all 0.25s ease-in-out;

// 主容器布局
.main-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: $bg-secondary;
}

// 左侧树状导航栏
.left-container {
  width: 240px;
  background-color: $bg-sidebar;
  border-right: 1px solid $border-color;
  transition: width $transition-default;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }
}

// 侧边栏头部
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $border-color;

  .sidebar-logo {
    color: $primary-color;
    font-size: 20px;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 12px;
    flex: 1;
  }

  .collapse-btn {
    color: $text-tertiary;
    cursor: pointer;
    transition: $transition-default;

    &:hover {
      color: $primary-color;
      transform: scale(1.1);
    }
  }

  .rotate-180 {
    transform: rotate(180deg);
  }
}

// 自定义树状图
.custom-tree {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 2px;
  }

  // 树节点样式
  .el-tree-node {
    padding: 10px 0;
  }

  // 选中节点样式
  .el-tree-node.is-current .tree-node-content {
    // background-color: rgba(66, 99, 235, 0.15);
    border-radius: $radius-sm;
  }

  // 节点内容
  .tree-node-content {
    display: flex;
    align-items: center;
    padding: 6px 20px;
    cursor: pointer;
    transition: $transition-default;
  }

  .node-icon {
    font-size: 16px;
    margin-right: 10px;
  }

  .node-label {
    font-size: 14px;
    color: $text-secondary;
    transition: $transition-default;
  }

  // 展开/收起图标
  .el-tree-node__expand-icon {
    color: $text-tertiary;
    font-size: 14px;

    &:hover {
      color: $primary-color;
    }
  }

  // 隐藏连接线
  .el-tree-node__children {
    padding-left: 16px !important;
  }

  .el-tree-node__line {
    display: none;
  }
}

// 右侧内容区域
.page-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  transition: $transition-default;
}

// 顶部操作栏
.page-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-color;

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// Figma风格按钮
.figma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: $radius-sm;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-default;
  white-space: nowrap;

  &.primary {
    background-color: $primary-color;
    color: #fff;

    &:hover {
      background-color: $primary-hover;
      box-shadow: 0 2px 8px rgba(66, 99, 235, 0.3);
    }
  }

  &.secondary {
    background-color: $bg-primary;
    color: $text-secondary;
    border: 1px solid $border-color;

    &:hover {
      background-color: $bg-secondary;
      border-color: #d1d5db;
    }
  }

  &.text-btn {
    background: transparent;
    color: $text-secondary;
    padding: 4px 8px;

    &:hover {
      background-color: $bg-secondary;
      color: $primary-color;
    }

    &.danger {
      color: #ef4444;

      &:hover {
        background-color: #fee2e2;
        color: #dc2626;
      }
    }

    .btn-icon {
      margin-right: 4px;
    }
  }

  &.icon-btn {
    background: transparent;
    color: $text-tertiary;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: $radius-sm;

    &:hover {
      background-color: $bg-secondary;
      color: $primary-color;
    }
  }
}

// 页面网格布局
.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

// 页面卡片
.page-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  overflow: hidden;
  transition: $transition-default;
  box-shadow: $shadow-sm;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    border-color: $primary-color;
  }
}

// 卡片缩略图
.card-thumbnail {
  height: 160px;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;

  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-default;
  }

  &:hover .thumbnail-img {
    transform: scale(1.03);
  }

  .placeholder-thumbnail {
    width: 100%;
    height: 100%;
    background-color: #f0f7ff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumbnail-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity $transition-default;
  }

  &:hover .thumbnail-overlay {
    opacity: 1;
  }

  .preview-text {
    color: #fff;
    background-color: $primary-color;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
}

// 卡片内容区
.card-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color $transition-default;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: $primary-color;
  }
}

.card-desc {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.5;
  margin: 0 0 16px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.placeholder-desc {
  color: $text-tertiary;
}

// 卡片元信息
.card-meta-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-meta {
  font-size: 12px;
  color: $text-tertiary;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

// 卡片操作区
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 16px;
  border-top: 1px solid $border-color;
}

// 空状态
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background-color: $bg-primary;
  border-radius: $radius-md;
  border: 1px solid $border-color;
  margin-top: 40px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    color: $text-tertiary;
    animation: float 3s ease-in-out infinite;
  }

  h3 {
    font-size: 18px;
    color: $text-primary;
    margin-bottom: 8px;
    font-weight: 500;
  }

  p {
    color: $text-tertiary;
    margin-bottom: 24px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    font-size: 14px;
  }
}

// 加载状态
.loading-container {
  padding: 60px 0;
  background-color: $bg-primary;
  border-radius: $radius-md;
  border: 1px solid $border-color;
  margin-top: 40px;
}

// 其他节点占位内容
.other-node-content {
  height: calc(100vh - 180px);
  display: flex;
  align-items: center;
  justify-content: center;

  .node-placeholder {
    text-align: center;
    padding: 40px;
    background-color: $bg-primary;
    border-radius: $radius-md;
    border: 1px solid $border-color;
    box-shadow: $shadow-sm;

    .placeholder-title {
      font-size: 18px;
      color: $text-primary;
      margin: 16px 0 8px;
      font-weight: 500;
    }

    .placeholder-desc {
      font-size: 14px;
      color: $text-tertiary;
    }
  }
}

// 浮动动画
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// 响应式适配
@media (max-width: 1024px) {
  .left-container {
    width: 80px;

    .sidebar-title,
    .node-label {
      display: none;
    }

    .sidebar-header {
      padding: 16px;

      .sidebar-logo {
        margin: 0 auto;
      }

      .collapse-btn {
        display: none;
      }
    }

    .tree-node-content {
      justify-content: center;
      padding: 8px 0;
    }

    .node-icon {
      margin-right: 0;
    }
  }

  .page-list-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .page-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-actions {
    flex-wrap: wrap;
  }
}
</style>
