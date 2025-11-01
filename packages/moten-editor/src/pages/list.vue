<template>
  <div class="page-list-container">
    <div class="page-list-header">
      <h1>链创低代码平台</h1>
      <div class="header-actions">
        <button class="figma-btn secondary" @click="hanleMarket">
          <el-icon :size="16"><Shop /></el-icon>
          插件市场
        </button>
        <button class="figma-btn primary" @click="handleCreateNew">
          <el-icon :size="16"><Plus /></el-icon>
          新建页面
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated :style="{ '--el-skeleton-bg': '#f3f4f6' }" />
    </div>

    <div v-else-if="pages.length === 0" class="empty-state">
      <div class="empty-icon">🖌️</div>
      <h3>暂无设计页面</h3>
      <p>创建你的第一个低代码设计页面，开启创作之旅</p>
      <button class="figma-btn primary" @click="handleCreateNew">立即创建</button>
    </div>

    <div v-else class="page-grid">
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
  </div>
</template>

<script setup lang="ts">
// 原有逻辑完全不变，此处完整保留
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Clock,
  EditPen,
  Edit,
  Delete,
  Document,
  Shop,
  Plus,
} from '@element-plus/icons-vue'
import { deletePageAcync, getPageAsync } from '@/api/page'
import { useUserStore } from '@/stores/user'
import { useEditStore } from '@/stores/edit'
import { exportToPdf } from '@/utils/exportPdf'

// 路由
const router = useRouter()
const userStore = useUserStore()
const pages = ref<any>([])
const loading = ref(true)
const edit = useEditStore()

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

// 加载页面列表
const loadPages = () => {
  try {
    loading.value = true
    pages.value = userStore.list
    console.log(pages.value)
  } catch (error) {
    console.error('加载页面列表失败:', error)
    ElMessage.error('加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

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
const hanleMarket = () => {
  router.push('/plugins')
}
// 编辑页面
const handleEdit = (pageId: string) => {
  const selectedPage = userStore.list.find((l: any) => l.page_id === pageId) as any
  edit.setEdit(true)
  edit.setPageConfig({
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
// Figma 核心设计变量（统一风格）
$figma-primary: #2563eb; /* 主色：Figma 标志性蓝色 */
$figma-primary-hover: #1d4ed8; /* 主色 hover */
$figma-primary-active: #1e40af; /* 主色 active */
$figma-secondary: #f3f4f6; /* 次要背景色 */
$figma-secondary-hover: #e5e7eb; /* 次要背景 hover */
$figma-text-primary: #1f2937; /* 主要文字色 */
$figma-text-secondary: #4b5563; /* 次要文字色 */
$figma-text-tertiary: #94a3b8; /* 辅助文字色 */
$figma-border: #e5e7eb; /* 边框色 */
$figma-radius: 8px; /* 统一圆角（Figma 标准） */
$figma-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 基础阴影 */
$figma-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.08); /* hover 阴影 */
$figma-transition: all 0.2s ease; /* 统一过渡动画 */

// 页面容器
.page-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: #ffffff;
}

// 头部区域
.page-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0;
  border: none; /* 移除底部边框，Figma 风格更简洁 */

  h1 {
    font-size: 20px;
    font-weight: 500;
    color: $figma-text-primary;
    margin: 0;
    padding: 0;
    position: relative;

    &::before {
      display: none; /* 移除左侧竖线，简化视觉 */
    }
  }

  .header-actions {
    display: flex;
    gap: 8px; /* 按钮间距 */
  }
}

// Figma 风格按钮（分级设计）
.figma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: $figma-radius;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: $figma-transition;
  white-space: nowrap;

  // 主要按钮（新建页面）
  &.primary {
    background-color: $figma-primary;
    color: #ffffff;

    &:hover {
      background-color: $figma-primary-hover;
    }

    &:active {
      background-color: $figma-primary-active;
    }
  }

  // 次要按钮（插件市场）
  &.secondary {
    background-color: $figma-secondary;
    color: $figma-text-primary;

    &:hover {
      background-color: $figma-secondary-hover;
    }

    &:active {
      background-color: #d1d5db;
    }
  }

  // 文字按钮（编辑/删除）
  &.text-btn {
    background: transparent;
    color: $figma-text-secondary;
    padding: 4px 8px;

    &:hover {
      background-color: $figma-secondary;
      color: $figma-primary;
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

  // 图标按钮（导出PDF）
  &.icon-btn {
    background: transparent;
    color: $figma-text-tertiary;
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 6px;

    &:hover {
      background-color: $figma-secondary;
      color: $figma-primary;
    }
  }
}

// 页面网格布局
.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px; /* 卡片间距 */
}

// 页面卡片（核心样式优化）
.page-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: default;
  border-radius: $figma-radius;
  overflow: hidden;
  transition: $figma-transition;
  background-color: #ffffff;
  border: 1px solid $figma-border;
  box-shadow: $figma-shadow;

  // Figma 轻盈 hover 效果
  &:hover {
    transform: translateY(-2px);
    box-shadow: $figma-shadow-hover;
    border-color: #d1d5db;
  }
}

// 卡片缩略图
.card-thumbnail {
  height: 160px;
  background-color: $figma-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  border-radius: 0; /* 与卡片圆角统一，顶部无额外圆角 */
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: $figma-transition;

  &:hover {
    transform: none; /* 取消单独缩放，继承卡片 hover 效果 */
    box-shadow: none;
  }

  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: $figma-transition;
  }

  &:hover .thumbnail-img {
    transform: scale(1.03); /* 轻微缩放，更自然 */
  }

  // 占位缩略图
  .placeholder-thumbnail {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f8fafc;
  }

  // 预览遮罩（Figma 半透明风格）
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
    transition: opacity 0.2s ease;
  }

  &:hover .thumbnail-overlay {
    opacity: 1;
  }

  .preview-text {
    color: #ffffff;
    font-weight: 500;
    padding: 6px 12px;
    background-color: $figma-primary;
    border-radius: 4px;
    font-size: 13px;
    letter-spacing: 0.3px;
  }
}

// 卡片内容区
.card-content {
  flex: 1;
  margin-bottom: 12px;
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 500;
  color: $figma-text-primary;
  cursor: pointer;
  line-height: 1.4;
  transition: $figma-transition;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: $figma-primary; /* 仅文字变色，简洁反馈 */
  }
}

// 描述文本
.card-desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: $figma-text-secondary;
  line-height: 1.5;
  min-height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-desc {
  color: $figma-text-tertiary;
  font-style: normal; /* 移除斜体，更简洁 */
}

// 元信息区域
.card-meta-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-meta {
  margin: 0;
  font-size: 11px;
  color: $figma-text-tertiary;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

// 卡片操作区
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 16px 16px;
  border-top: 1px solid $figma-border;
}

// 空状态（Figma 简约风格）
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: $figma-radius;
  margin-top: 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: $figma-text-tertiary;
  animation: float 3s ease-in-out infinite;
}

.empty-state h3 {
  font-size: 17px;
  color: $figma-text-primary;
  margin-bottom: 8px;
  font-weight: 500;
}

.empty-state p {
  color: $figma-text-tertiary;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  font-size: 13px;
}

// 加载状态
.loading-container {
  padding: 40px 0;
  background-color: #f9fafb;
  border-radius: $figma-radius;
  margin-top: 20px;
}

// 响应式适配（Figma 移动端简洁风格）
@media (max-width: 768px) {
  .page-list-container {
    padding: 16px;
  }

  .page-list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .page-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .card-desc {
    -webkit-line-clamp: 2; /* 保持2行，避免拥挤 */
  }
}

// 浮动动画（更柔和自然）
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
