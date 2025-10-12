<template>
  <div class="plugin-upload">
    <h2>📦 上传插件</h2>
    <form @submit.prevent="submitPlugin">
      <input v-model="form.name" placeholder="插件名称" required />
      <textarea v-model="form.description" placeholder="描述" required></textarea>
      <input v-model="form.version" placeholder="版本号" required />
      <input v-model="form.author" placeholder="作者" required />
      <input v-model="form.tags" placeholder="标签（逗号分隔）" />
      <input type="file" @change="onFileChange" required />
      <button type="submit">上传</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { uploadPluginAsync } from '@/api/plugins'
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'

const form = reactive({
  name: '',
  description: '',
  version: '',
  author: '',
  tags: '',
  file: '',
})
const onFileChange = (e: any) => {
  form.file = e.target.files[0]
}
const submitPlugin = async () => {
  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('description', form.description)
  formData.append('version', form.version)
  formData.append('author', form.author)
  formData.append('tags', form.tags)
  formData.append('pluginFile', form.file)

  try {
    const res = await uploadPluginAsync(formData)
    if (res.status) {
      ElMessage.success('上传成功, 等待审核')
    } else {
      ElMessage.warning('上传失败')
    }
  } catch (error: any) {
    ElMessage.warning('上传失败')
    console.warn(error.message)
  }
}
</script>

<style scoped lang="scss">
// 容器整体样式
.plugin-upload {
  max-width: 600px;
  margin: 30px auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 标题样式
.plugin-upload h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

// 表单样式
.plugin-upload form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 输入框通用样式
.plugin-upload form input,
.plugin-upload form textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

// 输入框聚焦效果
.plugin-upload form input:focus,
.plugin-upload form textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

// 文本域特殊样式（固定高度+可滚动）
.plugin-upload form textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
}

// 文件选择框样式
.plugin-upload form input[type='file'] {
  padding: 10px 16px;
  background-color: #f9fafb;
  cursor: pointer;
}

// 提交按钮样式
.plugin-upload form button[type='submit'] {
  width: 100%;
  padding: 12px 0;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

// 按钮hover效果
.plugin-upload form button[type='submit']:hover {
  background-color: #337ecc;
}

// 按钮禁用状态（预防重复提交，可选）
.plugin-upload form button[type='submit']:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

// 占位符样式
.plugin-upload form input::placeholder,
.plugin-upload form textarea::placeholder {
  color: #999;
  font-size: 14px;
}
</style>
