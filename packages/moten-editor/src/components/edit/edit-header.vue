<template>
  <div class="header">
    <div class="header-left">
      <div class="back" @click="goHome">
        <v-icon content="返回" icon="back" />
        <div class="header-title">页面</div>
      </div>

      <div class="line"></div>
      <div v-if="isPreview" class="viewport-toggle">
        <el-switch
          v-model="isDesktop"
          active-color="#2563eb"
          inactive-color="#e5e7eb"
          style="--el-switch-width: 40px; --el-switch-height: 20px"
        />
        <span class="viewport-label">{{ isDesktop ? '移动端' : '桌面端' }}</span>
      </div>
      <div v-else class="viewport-selector">
        <v-select
          v-model="viewport"
          :options="[
            { label: '桌面端', value: 'desktop' },
            { label: '移动端', value: 'mobile' },
          ]"
          style="width: 120px"
        />
      </div>
    </div>
    <div class="header-right">
      <div class="action-buttons">
        <button class="figma-btn secondary" @click="exportProject" :disabled="exporting">
          <v-icon icon="export" class="btn-icon" />
          {{ exporting ? '导出中...' : '导出项目' }}
        </button>
        <button class="figma-btn secondary" @click="exportPDF">
          <v-icon icon="pdf" class="btn-icon" />
          导出PDF
        </button>
      </div>

      <div class="collaboration-controls">
        <button
          class="figma-btn"
          :class="{
            connected: collabStore.isConnected,
            connecting: collabStore.connectionStatus === 'connecting',
          }"
          @click="toggleCollaboration"
          :disabled="collabStore.connectionStatus === 'connecting'"
        >
          <v-icon icon="collaborate" class="btn-icon" />
          {{
            collabStore.connectionStatus === 'connecting'
              ? '连接中...'
              : collabStore.isConnected
                ? '退出协同'
                : '开始协同'
          }}
        </button>

        <div class="online-indicator" v-if="collabStore.isConnected">
          <div class="user-count-badge">
            {{ collabStore.onlineUsers }}
          </div>
          <span class="online-label">人在线编辑</span>
        </div>
      </div>

      <div class="publish-controls">
        <template v-if="!edit.isEdit">
          <button class="figma-btn secondary" @click="togglePreview">
            <v-icon icon="preview" class="btn-icon" />
            预览
          </button>
          <button class="figma-btn primary" @click="submit">
            <v-icon icon="publish" class="btn-icon" />
            发布
          </button>
        </template>
        <template v-else>
          <button class="figma-btn primary" @click="uploadEdite">
            <v-icon icon="Edit" class="btn-icon" />
            发布编辑
          </button>
        </template>
      </div>
    </div>
  </div>
  <collabModel v-model:visible="showCollabModal"></collabModel>
</template>

<script setup lang="ts">
import type { Viewport } from '@/types/edit'
import { nextTick, onUnmounted, ref, toRaw, watch } from 'vue'
import { useEditStore } from '@/stores/edit'
import Ajv from 'ajv'
import AjvErrors from 'ajv-errors'
import { blockSchema, type BlockSchemaKeys } from '@/config/schema'
import { findNodeById } from './nested'
import { useRouter, useRoute } from 'vue-router'
import { editPageAsync, submitPageAsync } from '@/api/page'
import { ElMessage } from 'element-plus'
import { useCollaborationStore } from '@/stores/collaborationStore'
import collabModel from '@/pages/collabModel.vue'
import { uploadImage } from '@/utils'
import { exportToPdf } from '@/utils/exportPdf'
const showCollabModal = ref(false)
const collabStore = useCollaborationStore()
const route = useRoute()
const router = useRouter()
const edit = useEditStore()
const viewport = ref<Viewport>('desktop')
const isDesktop = ref(false)
const exporting = ref(false)
const toggleCollaboration = async () => {
  if (collabStore.isConnected) {
    collabStore.disconnect()
  } else {
    showCollabModal.value = true
  }
}

const ajv = new Ajv({ allErrors: true })
ajv.addKeyword({
  keyword: ['placeholder', 'rules', 'code'],
})
AjvErrors(ajv)
const props = defineProps<{
  isPreview?: boolean
}>()
const validateAll = async (item: any) => {
  const { value, schema, id } = item
  const validate = ajv.compile(schema)
  const valid = validate(value)
  if (!valid) {
    const path = validate.errors?.[0]?.instancePath
    if (path) {
      const [, , pathViewport] = path.split('/')

      viewport.value = pathViewport as Viewport

      await nextTick() // 注意没有这个会导致 下面先于watch执行，所以currentSelect不会发生变化，会出现问题

      edit.setViewport(pathViewport as Viewport)
      edit.setConfigPanelShow(true)
      findNodeById(edit.blockConfig, id, (params) => {
        const { node } = params
        edit.setCurrentSelect(node)
      })
    }

    console.warn('ajv error: ', id, validate.errors?.[0].instancePath, validate.errors?.[0].message)
    return
  }
  console.warn('ajv submit!')
}

const exportProject = async () => {
  exporting.value = true

  try {
    const response = await fetch('http://localhost:8081/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'my-project',
        id: localStorage.getItem('collab_user_name'),
      }),
    })
    if (!response.ok) {
      throw new Error('请求失败')
    }

    const bolb = await response.blob()
    const url = window.URL.createObjectURL(bolb)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-project.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功！')
    collabStore.dismissRoom()
    router.push('/')
  } catch (error: any) {
    ElMessage.error('导出失败！', error.message)
  } finally {
    exporting.value = false
  }
}

const waitImageReady = (imgSelector: string) => {
  return new Promise<void>((resolve) => {
    const img = document.querySelector<HTMLImageElement>(imgSelector)
    console.log(img)
    if (!img) return resolve()
    if (img.complete) return resolve()
    img.onload = resolve as any
    img.onerror = resolve as any
  })
}

const exportPDF = async () => {
  await waitImageReady('#image')
  const container = document.querySelector('.edit-render')
  if (!container) {
    ElMessage.error('未找到画布容器')
    return
  }
  exportToPdf('.edit-render', {
    filename: 'test.pdf',
    margin: 15,
    jsPDF: { orientation: 'portrait' },
  })
}
const uploadEdite = async () => {
  const { title, description, keywords } = edit.pageConfig as any
  const pageCover = edit.pageCover
  let imageUrl = await uploadImage(pageCover)
  const list = edit.blockConfig.map((item) => {
    return {
      id: item.id,
      name: title[edit.viewport] || '',
      description: description[edit.viewport] || '',
      keywords: keywords[edit.viewport],
      value: item.formData || '',
      schema: blockSchema[item.code as BlockSchemaKeys] || '',
      code: item.code || '',
      children: item.children || [],
      nested: item.nested || false,
    }
  })
  list.forEach((item) => {
    validateAll(item)
  })
  const JSONList = convertToJSON(list)
  try {
    const { status, message } = await editPageAsync({
      id: Number(route.params.id),
      name: list[0].name || '',
      content: JSONList || '',
      description: description[edit.viewport] || '',
      coverImage: (imageUrl as any) || '',
    })
    if (status) {
      ElMessage.success('发布编辑成功')
      edit.setEdit(false)
      edit.setPageConfig({} as any)
      router.push('/')
    } else {
      ElMessage.error('发布编辑失败', message)
    }
  } catch (error: any) {
    ElMessage.error('发布编辑失败')
    console.error('发布编辑失败', error)
  }
}
const submit = async () => {
  const { title, description, keywords } = edit.pageConfig as any
  const pageCover = edit.pageCover
  let imageUrl = await uploadImage(pageCover)
  const list = edit.blockConfig.map((item) => {
    return {
      id: item.id,
      name: title[edit.viewport],
      description: description[edit.viewport],
      keywords: keywords[edit.viewport],
      value: item.formData,
      schema: blockSchema[item.code as BlockSchemaKeys],
      code: item.code,
      children: item.children,
      nested: item.nested,
      x: item.x,
      y: item.y,
    }
  })
  list.forEach((item) => {
    validateAll(item)
  })
  const JSONList = convertToJSON(list)
  try {
    const { status, message } = await submitPageAsync({
      name: list[0].name,
      content: JSONList,
      description: description[edit.viewport],
      coverImage: imageUrl as any,
    })
    if (status) {
      ElMessage({
        message: '发布成功',
        type: 'success',
      })
      collabStore.dismissRoom()
      router.push('/')
      setTimeout(() => {
        edit.setPageConfig({} as any)
        edit.setBlockConfig([] as any)
      }, 0)
    } else {
      ElMessage({
        message: '发布失败: ' + message,
        type: 'error',
      })
    }
  } catch (error) {
    ElMessage({
      message: '发布过程中出现错误 请添加内容',
      type: 'error',
    })
  }
}

const convertToJSON = (data: any) => {
  const raw = toRaw(data)
  return JSON.stringify(raw, null, 2)
}

const goHome = () => {
  edit.setEdit(false)
  router.push('/')
}
// 预览模式的替换
const togglePreview = () => {
  edit.setPreview(!edit.isPreview)
}

watch(isDesktop, (val) => {
  val === true ? (viewport.value = 'mobile') : (viewport.value = 'desktop')
})
watch(viewport, (val) => {
  edit.setViewport(val)
  edit.setConfigPanelShow(val === 'mobile')
  edit.setCurrentSelect({} as any)
})
onUnmounted(() => {
  collabStore.disconnect()
})
</script>

<style scoped lang="scss">
// 全局变量（贴合 Figma 设计语言）
$figma-primary: #2563eb; // Figma 主色（蓝）
$figma-primary-hover: #1d4ed8; // 主色 hover
$figma-primary-active: #1e40af; // 主色 active
$figma-secondary: #f3f4f6; // 次要按钮背景
$figma-secondary-hover: #e5e7eb; // 次要按钮 hover
$figma-secondary-active: #d1d5db; // 次要按钮 active
$figma-text: #1f2937; // 主要文本色
$figma-text-light: #6b7280; // 次要文本色
$figma-border: #e5e7eb; // 边框色
$figma-radius: 4px; // 统一圆角（Figma 风格）
$figma-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); // 轻微阴影
$figma-transition: all 0.15s ease; // 统一过渡

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 500;
  height: 62px; // 优化高度（Figma 头部更紧凑）
  background: #ffffff;
  border-bottom: 1px solid $figma-border; // 仅底部边框（更简洁）
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px; // 优化内边距
  box-shadow: $figma-shadow; // 轻微阴影增强层次感

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px; // 统一间距

    .back {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: $figma-radius;
      cursor: pointer;
      transition: $figma-transition;

      &:hover {
        background-color: $figma-secondary;
      }

      .header-title {
        font-size: 14px;
        font-weight: 500;
        color: $figma-text;
      }

      v-icon {
        color: $figma-text;
        width: 16px;
        height: 16px;
      }
    }

    .line {
      width: 1px;
      height: 24px;
      background-color: $figma-border;
      padding: 0; // 清除多余内边距
    }

    // 视图切换（预览模式）
    .viewport-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: $figma-text-light;
      font-size: 13px;
    }

    .viewport-label {
      white-space: nowrap;
    }

    // 视图选择器（编辑模式）
    .viewport-selector {
      v-select {
        --el-select-input-height: 32px;
        --el-select-dropdown-border-color: $figma-border;
        --el-select-hover-border-color: $figma-primary;
        --el-select-active-border-color: $figma-primary;
        font-size: 13px;

        .el-input__inner {
          border-radius: $figma-radius;
          border-color: $figma-border;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px; // 统一间距
  }

  // 功能按钮组
  .action-buttons,
  .collaboration-controls,
  .publish-controls {
    display: flex;
    align-items: center;
    gap: 8px; // 按钮间距
  }

  // Figma 风格按钮
  .figma-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: $figma-radius;
    border: none;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: $figma-transition;
    white-space: nowrap;

    .btn-icon {
      width: 16px;
      height: 16px;
    }

    // 主要按钮（发布/编辑）
    &.primary {
      background-color: $figma-primary;
      color: #ffffff;

      &:hover {
        background-color: $figma-primary-hover;
      }

      &:active {
        background-color: $figma-primary-active;
      }

      &:disabled {
        background-color: #93c5fd;
        cursor: not-allowed;
        opacity: 0.8;
      }
    }

    // 次要按钮（导出/预览）
    &.secondary {
      background-color: $figma-secondary;
      color: $figma-text;

      &:hover {
        background-color: $figma-secondary-hover;
      }

      &:active {
        background-color: $figma-secondary-active;
      }

      &:disabled {
        background-color: #f9fafb;
        color: $figma-text-light;
        cursor: not-allowed;
      }
    }

    // 协同按钮状态
    &.connected {
      background-color: #10b981; // Figma 协同连接色（绿）

      &:hover {
        background-color: #059669;
      }

      &:active {
        background-color: #047857;
      }
    }

    &.connecting {
      background-color: $figma-secondary;
      color: $figma-text-light;
      cursor: not-allowed;
    }
  }

  // 在线指示器
  .online-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    color: $figma-text-light;
    font-size: 12px;

    .user-count-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: $figma-primary;
      color: #ffffff;
      font-size: 11px;
      font-weight: 500;
      border: 2px solid #ffffff; // 白色边框增强质感
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .online-label {
      white-space: nowrap;
    }
  }
}

// 适配小屏幕（保持 Figma 简洁性）
@media (max-width: 768px) {
  .header {
    padding: 0 8px;
    height: 44px;
  }

  .header-right {
    gap: 8px;
  }

  .figma-btn {
    padding: 4px 8px;
    font-size: 12px;

    .btn-icon {
      width: 14px;
      height: 14px;
    }

    // 隐藏次要按钮文本，仅保留图标
    &.secondary span:not(.btn-icon) {
      display: none;
    }
  }

  .online-indicator .online-label {
    display: none;
  }
}
</style>
