<template>
  <div class="plugin-upload-container">
    <!-- 页面标题区 -->
    <div class="page-header">
      <h2 class="page-title">📦 上传插件</h2>
      <p class="page-desc">请填写插件信息并上传插件包，上传后将进入审核流程</p>
    </div>

    <!-- 表单卡片 -->
    <div class="upload-card">
      <el-form
        ref="uploadForm"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="upload-form"
        @submit.prevent="submitPlugin"
      >
        <!-- 基础信息组 -->
        <el-form-item label="插件名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入插件名称（最多30个字符）"
            maxlength="30"
            clearable
          />
        </el-form-item>

        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号（格式如：1.0.0）" clearable />
        </el-form-item>

        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者名称或团队名称" clearable />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，用逗号分隔（最多5个）" clearable />
          <div class="form-hint">标签将帮助用户更好地找到您的插件</div>
        </el-form-item>

        <!-- 描述信息组 -->
        <el-form-item label="插件描述" prop="description">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请详细描述插件功能、使用场景等信息"
            :rows="4"
            maxlength="500"
          />
          <div class="form-hint">
            <span>{{ form.description.length }}/500</span>
          </div>
        </el-form-item>

        <!-- 插件文件上传 -->
        <el-form-item label="插件包" prop="file" class="file-upload-item">
          <el-upload
            class="plugin-uploader"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeFileUpload"
            :auto-upload="false"
            accept=".zip,.tar,.gz"
          >
            <el-button size="default" type="primary" class="upload-btn">
              <el-icon class="upload-icon"><Upload /></el-icon>
              选择插件包
            </el-button>
            <div class="upload-hint">支持 .zip, .tar, .gz 格式，文件大小不超过50MB</div>
          </el-upload>
        </el-form-item>

        <!-- 提交区域 -->
        <el-form-item class="form-actions">
          <el-button
            type="primary"
            @click="submitPlugin"
            :loading="isSubmitting"
            class="submit-btn"
          >
            <el-icon v-if="isSubmitting" class="loading-icon"><Loading /></el-icon>
            提交审核
          </el-button>
          <el-button type="default" @click="resetForm" class="reset-btn" :disabled="isSubmitting">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElInput, ElUpload, ElButton, ElIcon } from 'element-plus'
import { Upload, Loading } from '@element-plus/icons-vue'
import { uploadPluginAsync } from '@/api/plugins'

// 表单引用
const uploadForm = ref<InstanceType<typeof ElForm>>()

// 表单数据
const form = reactive({
  name: '',
  description: '',
  version: '',
  author: '',
  tags: '',
  file: null as File | null,
})

// 文件列表
const fileList = ref<any[]>([])

// 提交状态
const isSubmitting = ref(false)

const validateTags = (rule: any, value: string, callback: any) => {
  if (value) {
    const tags = value.split(',').filter((t) => t.trim())
    if (tags.length > 5) {
      callback(new Error('最多只能输入5个标签'))
    }
  }
  callback()
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入插件名称', trigger: 'blur' },
    { max: 30, message: '名称不能超过30个字符', trigger: 'blur' },
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式应为 x.y.z（如 1.0.0）', trigger: 'blur' },
  ],
  author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
  description: [
    { required: true, message: '请输入插件描述', trigger: 'blur' },
    { min: 10, message: '描述不能少于10个字符', trigger: 'blur' },
  ],
  tags: [{ validator: validateTags, trigger: 'blur' }],
  file: [{ required: true, message: '请选择插件包', trigger: 'change' }],
}

// 文件选择处理
const handleFileChange = (file: any) => {
  // 只保留最新选择的文件
  fileList.value = [file]
  form.file = file.raw
}

// 移除文件
const handleFileRemove = () => {
  fileList.value = []
  form.file = null
}

// 上传前校验
const beforeFileUpload = (file: File) => {
  // 校验文件大小（50MB）
  const isLt50MB = file.size / 1024 / 1024 < 50
  if (!isLt50MB) {
    ElMessage.error('插件包大小不能超过50MB！')
    return false
  }
  // 校验文件类型
  const acceptTypes = ['.zip', '.tar', '.gz']
  const fileExt = file.name.substring(file.name.lastIndexOf('.'))
  if (!acceptTypes.includes(fileExt)) {
    ElMessage.error('只支持 .zip, .tar, .gz 格式的文件！')
    return false
  }
  return true
}

// 提交表单
const submitPlugin = async () => {
  // 表单验证
  if (!uploadForm.value) return
  const valid = await uploadForm.value.validate()
  if (!valid) return

  // 准备提交数据
  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('description', form.description)
  formData.append('version', form.version)
  formData.append('author', form.author)
  formData.append('tags', form.tags)
  if (form.file) {
    formData.append('pluginFile', form.file)
  }

  try {
    isSubmitting.value = true
    const res = await uploadPluginAsync(formData)
    if (res.status) {
      ElMessage.success({
        message: '上传成功，等待审核',
        duration: 3000,
      })
      // 重置表单
      resetForm()
    } else {
      ElMessage.warning('上传失败：' + (res.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('上传出错：' + error.message)
    console.warn('上传失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (uploadForm.value) {
    uploadForm.value.resetFields()
  }
  fileList.value = []
  form.file = null
}
</script>

<style scoped lang="scss">
// 全局变量（与插件市场保持一致）
$primary-color: #4263eb;
$primary-light: #e8f0fe;
$text-primary: #1d2129;
$text-secondary: #4e5969;
$text-tertiary: #86909c;
$border-color: #e5e6eb;
$bg-primary: #ffffff;
$bg-secondary: #f7f8fa;
$radius-sm: 6px;
$radius-md: 8px;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
$transition-default: all 0.25s ease-in-out;

// 页面容器
.plugin-upload-container {
  max-width: 800px;
  margin: 32px auto;
  padding: 0 20px;
}

// 页面标题
.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .page-desc {
    font-size: 14px;
    color: $text-tertiary;
    margin: 0;
    padding-left: 2px;
  }
}

// 上传卡片
.upload-card {
  background-color: $bg-primary;
  border-radius: $radius-md;
  border: 1px solid $border-color;
  box-shadow: $shadow-sm;
  padding: 30px;
}

// 表单样式
.upload-form {
  --el-form-item-margin-bottom: 20px;
}

// 表单提示
.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: $text-tertiary;
  display: flex;
  justify-content: space-between;
}

// 文件上传区域
.file-upload-item {
  .plugin-uploader {
    width: 100%;

    .upload-btn {
      margin-bottom: 12px;
    }

    .upload-icon {
      margin-right: 6px;
    }

    .upload-hint {
      font-size: 12px;
      color: $text-tertiary;
      margin-top: 4px;
    }
  }
}

// 表单操作区
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 30px;
  justify-content: flex-end;

  .submit-btn {
    padding: 8px 24px;
    background-color: $primary-color;
    border-color: $primary-color;
    transition: $transition-default;

    &:hover {
      background-color: #3351d8;
      border-color: #3351d8;
    }

    .loading-icon {
      margin-right: 6px;
      animation: spin 1s linear infinite;
    }
  }

  .reset-btn {
    padding: 8px 24px;
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
  .upload-card {
    padding: 20px 16px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;

    .submit-btn,
    .reset-btn {
      width: 100%;
    }
  }
}
</style>
