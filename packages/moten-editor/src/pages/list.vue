<template>
  <div class="page-list-container">
    <div class="page-list-header">
      <h1>低代码展示页面</h1>
      <el-button type="primary" @click="handleCreateNew" icon="Plus">
        新建页面
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="pages.length === 0" class="empty-state">
      <div class="empty-icon">🎨</div>
      <h3>暂无页面</h3>
      <p>点击"新建页面"开始创建你的第一个低代码页面</p>
      <el-button type="primary" @click="handleCreateNew"> 立即创建 </el-button>
    </div>

    <div v-else class="page-grid">
      <el-card v-for="page in pages" :key="page.id" class="page-card" shadow="hover">
        <div class="card-thumbnail" @click="handlePreview(page.page_id)">
          <img
            v-if="page.coverImage"
            :src="`http://localhost:8081${page.coverImage}`"
            :alt="page.title"
            class="thumbnail-img"
          />
          <div v-else class="placeholder-thumbnail">
            <el-icon :size="48" color="#999">
              <Picture />
            </el-icon>
          </div>
        </div>

        <div class="card-content">
          <h3 class="card-title" @click="handlePreview(page.page_id)">
            {{ page.name }}
          </h3>
          <p v-if="page.description" class="card-desc">
            {{ page.description }}
          </p>
          <p v-else class="card-desc placeholder-desc">暂无描述</p>
          <p class="card-meta">创建时间: {{ formatDate(page.create_time) }}</p>
          <p class="card-meta">更新时间: {{ formatDate(page.update_time) }}</p>
        </div>

        <div class="card-actions">
          <el-button size="small" @click="handleEdit(page.page_id)"> 编辑 </el-button>
          <el-button size="small" type="danger" @click="handleDelete(page.page_id)">
            删除
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import icon from '@/config/icon'
import { deletePageAcync, getPageAsync } from '@/api/page'
import { useUserStore } from '@/stores/user'

// 路由
const router = useRouter()
const userStore = useUserStore()
const pages = ref<any>([])
const loading = ref(true)

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

// 创建新页面
const handleCreateNew = () => {
  router.push('/edit')
}

// 编辑页面
const handleEdit = (pageId: string) => {
  router.push(`/edit/${pageId}`)
}

const handlePreview = (pageId :string) => {
  router.push(`/preview/${pageId}`)
}

// 删除页面
const handleDelete = async (pageId: string) => {
  const params = { id: (pageId) }
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

<style scoped>
.page-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.page-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.card-thumbnail {
  height: 180px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-thumbnail:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
}

.card-content {
  flex: 1;
  margin-bottom: 16px;
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  line-height: 1.4;
}

.card-title:hover {
  color: #409eff;
}

/* 新增描述样式 */
.card-desc {
  margin: 8px 0 16px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  min-height: 20px; /* 确保占位 */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制2行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-desc {
  color: #c0c4cc;
  font-style: italic;
}

.card-meta {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  color: #c0c4cc;
}

.loading-container {
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-list-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .page-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-desc {
    -webkit-line-clamp: 3; /* 移动端显示3行 */
  }
}
</style>
