<template>
  <div class="toolbar">
    <!-- 左侧工具按钮组 -->
    <div class="toolbar-group left-group">
      <button
        class="tool-btn"
        title="pen"
        @click="penClick($event)"
        :class="{ active: edit.isFreehandMode }"
      >
        <v-icon icon="pen" class="icon"></v-icon>
      </button>
      <button
        class="tool-btn"
        title="eraser"
        @click="eraserClick($event)"
        :class="{ active: edit.isEraserMode }"
      >
        <v-icon icon="eraser" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="clear" @click="clearClick($event)">
        <v-icon icon="clear" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="stickyNote" @click="stickyNodeClick()">
        <v-icon icon="sticky" class="icon"></v-icon>
      </button>
      <button
        class="tool-btn"
        title="arrow"
        @click="arrowClick($event)"
        :class="{ active: edit.isArrowMode }"
      >
        <v-icon icon="arrow" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="undo" @click="undoClick()" :disabled="!edit.canUndo">
        <v-icon icon="undo" class="icon"></v-icon>
      </button>
      <button class="tool-btn" title="redo" @click="redoClick()" :disabled="!edit.canRedo">
        <v-icon icon="redo" class="icon"></v-icon>
      </button>
    </div>

    <!-- 中间信息区域 -->
    <div class="middle-info">
      <span>1 个页面</span>
      <span class="separator">•</span>
      <span>{{ edit.zoomRatio }}% 缩放</span>
    </div>

    <!-- 右侧控制区域 -->
    <div class="toolbar-group right-group">
      <!-- 显示网格：active绑定showGrid -->
      <button
        class="tool-btn"
        title="显示网格 (Shift+G)"
        @click="toggleGrid"
        :class="{ active: edit.showGrid }"
      >
        <v-icon icon="grid" class="icon"></v-icon>
      </button>
      <button
        class="tool-btn"
        title="评论区"
        @click="toggleComment"
        :class="{ active: edit.showComment }"
      >
        <v-icon icon="comment" class="icon"></v-icon>
      </button>
      <!-- 布局网格：active绑定showLayoutGrid -->
      <div class="separator"></div>
      <!-- 缩小 -->
      <button class="zoom-btn" title="缩小" @click="handleZoomOut">
        <v-icon icon="subtract" class="icon"></v-icon>
      </button>
      <!-- 缩放输入框：绑定Store的zoomRatio -->
      <div class="zoom-input">
        <input type="text" :value="edit.zoomRatio + '%'" readonly />
      </div>
      <!-- 放大 -->
      <button class="zoom-btn" title="放大" @click="handleZoomIn">
        <v-icon icon="add" class="icon"></v-icon>
      </button>
      <!-- 适应屏幕 -->
      <button class="tool-btn" title="适应屏幕 (Shift+1)" @click="handleZoomToFit">
        <v-icon icon="screen" class="icon"></v-icon>
      </button>
    </div>
  </div>

  <!-- 评论区 -->
  <div class="comment-panel" :class="{ 'is-show': edit.showComment }">
    <div class="panel-header">
      <span class="panel-title">评论区</span>
      <v-icon icon="refresh" class="refresh-icon" @click="fetchComments" title="刷新评论"></v-icon>
      <v-icon icon="close" class="close-icon" @click="toggleComment" title="关闭评论区"></v-icon>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" ref="commentListRef">
      <div
        v-for="comment in currentComments"
        :key="comment.id"
        class="comment-item"
        :class="{ resolved: comment.resolved }"
      >
        <div class="comment-content">
          {{ comment.content }}
        </div>
        <div class="comment-meta">
          <span class="author">{{ comment.username || '匿名用户' }}</span>
          <span class="time">{{ formatTime(comment.createdAt) }}</span>
          <button v-if="!comment.resolved" class="resolve-btn" @click="resolveComment(comment.id)">
            √ 解决
          </button>
        </div>
      </div>
      <div v-if="currentComments.length === 0 && collab.isConnected" class="no-comments">
        暂无评论，快来添加第一条评论～
      </div>
      <div v-if="!collab.isConnected" class="no-connection">未连接协作服务，无法查看评论</div>
    </div>

    <!-- 评论输入区（仅连接协作时显示） -->
    <div class="comment-input-wrap" v-if="collab.isConnected">
      <textarea
        v-model="newComment"
        placeholder="请输入评论（支持@提及成员）"
        @keypress.enter.exact.prevent="addNewComment"
        ref="commentTextRef"
        @input="handleInput"
        @keydown="handleKeydown"
        @click="handleClick"
      ></textarea>
      <button :disabled="!newComment.trim()" @click="addNewComment" class="send-btn">
        发送评论
      </button>
    </div>

    <!-- @提及列表 -->
    <div
      class="mention-list"
      v-if="mentionVisible"
      :style="{ top: mentionPosition.top + 'px', left: mentionPosition.left + 'px' }"
      ref="mentionListRef"
    >
      <div
        class="mention-item"
        v-for="(user, index) in mockUsers"
        :key="index"
        :class="{ 'mention-item--active': index === selectedIndex }"
        @click="selectedMention(user)"
      >
        {{ user.username }}
      </div>
    </div>
  </div>

  <!-- 遮罩层 -->
  <div class="comment-mask" :class="{ 'is-show': edit.showComment }" @click="toggleComment"></div>
</template>

<script setup lang="ts">
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditStore } from '@/stores/edit'
import type { BaseBlock } from '@/types/edit'
import { ElMessage } from 'element-plus'
import { computed, ref, watch, nextTick, onUnmounted, onMounted } from 'vue'

const edit = useEditStore()
const collab = useCollaborationStore()
const newComment = ref('')
const commentTextRef = ref<HTMLTextAreaElement | null>(null)
const commentListRef = ref<HTMLElement | null>(null)
const mentionVisible = ref(false)
const mentionPosition = ref({ top: 0, left: 0 })
const mockUsers = ref<any[]>([])
const selectedIndex = ref(-1)
const currentComments = computed(() => collab.comments)
const targetId = computed(() => edit.currentSelect?.id || 'PAGE_ROOT')
const mentionQuery = ref('')

const penClick = (e: MouseEvent) => {
  edit.toggleFreehandMode()
}
const eraserClick = (e: MouseEvent) => {
  edit.toggleEraserMode()
}
const clearClick = (e: MouseEvent) => {
  edit.resetToolMode()
  edit.canvasInstance.clearAllDraw()
  edit.setCanvasDrawData(edit.viewport, '')
}
const stickyNodeClick = () => {
  edit.addBlock({
    id: '',
    code: 'textarea',
    name: '文本',
    icon: 'text',
    formData: {},
    x: 100,
    y: 100,
  } as BaseBlock)
}
const arrowClick = (e: MouseEvent) => {
  edit.toggleArrowMode()
}
const undoClick = () => {
  if (edit.canUndo) {
    edit.canvasInstance.undo()
  }
}
const redoClick = () => {
  if (edit.canRedo) {
    edit.canvasInstance.redo()
  }
}
const handleZoomIn = () => edit.zoomIn()
const handleZoomOut = () => edit.zoomOut()
const handleZoomToFit = () => edit.zoomToFit()

const toggleGrid = () => {
  edit.toggleShowGrid()
}
const toggleComment = () => {
  edit.toggleComment()
  // 打开时刷新评论和用户列表
  if (!edit.showComment) return
  if (collab.isConnected) {
    fetchComments()
    fetchUsers()
  }
}

const formatTime = (timeStamp: number): string => {
  const data = new Date(timeStamp)
  return data.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchComments = () => {
  if (collab.isConnected) {
    collab.fetchComments()
  } else {
    ElMessage.warning('协作服务未连接，无法刷新评论')
  }
}

const fetchUsers = () => {
  if (collab.isConnected) {
    collab.getAllUsers()
    mockUsers.value = collab.userList || []
  }
}

const addNewComment = () => {
  if (!collab.isConnected) {
    ElMessage.error('请先连接服务器')
    return
  }
  const content = newComment.value.trim()
  if (!content) return
  const mentions = [...content.matchAll(/@(\w+)/g)].map((m) => m[1])
  collab.addCommment({
    componentId: targetId.value,
    content: newComment.value.trim(),
    authorName: '当前用户',
    position: { x: 0, y: 0 },
    mentions,
  })
  newComment.value = ''
  scrollToBottom()
}

const resolveComment = (id: string) => {
  if (!collab.isConnected) {
    ElMessage.error('请先连接服务器')
    return
  }
  collab.resolveComment(id)
}
const scrollToBottom = () => {
  nextTick(() => {
    if (commentListRef.value) {
      commentListRef.value.scrollTop = commentListRef.value.scrollHeight
    }
  })
}

const handleInput = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  const cursorPos = el.selectionStart
  const textBeforeCursor = newComment.value.slice(0, cursorPos)
  const mentionMatch = textBeforeCursor.match(/@\w*$/)
  if (mentionMatch) {
    mentionQuery.value = mentionMatch[0].slice(1)
    if (mockUsers.value.length > 0) {
      showMentionList(el, cursorPos)
    } else {
      mentionVisible.value = false
    }
  } else {
    mentionVisible.value = false
  }
}

const showMentionList = (el: HTMLTextAreaElement, cursor: number) => {
  const rect = el.getBoundingClientRect()
  mentionPosition.value = {
    top: rect.bottom + window.scrollY - 10,
    left: rect.left + window.scrollX,
  }
  mentionVisible.value = true
  selectedIndex.value = -1
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!mentionVisible.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, mockUsers.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  } else if (e.key === 'Enter' && selectedIndex.value !== -1) {
    e.preventDefault()
    selectedMention(mockUsers.value[selectedIndex.value])
  } else if (e.key === 'Escape') {
    mentionVisible.value = false
    selectedIndex.value = -1
  }
}

const handleClick = () => {
  mentionVisible.value = false
  if (collab.isConnected && mockUsers.value.length === 0) {
    fetchUsers()
  }
}
const selectedMention = (user: { username: string; id: string }) => {
  const current = newComment.value
  const cursorPos = commentTextRef.value?.selectionStart || 0
  const textBefore = current.slice(0, cursorPos)
  const textAfter = current.slice(cursorPos)
  const atIndex = textBefore.lastIndexOf('@')
  const newText = textBefore.slice(0, atIndex) + `@${user.username}` + textAfter
  newComment.value = newText
  mentionVisible.value = false
  selectedIndex.value = -1
  nextTick(() => {
    const newCursorPos = atIndex + user.username.length + 1
    commentTextRef.value?.setSelectionRange(newCursorPos, newCursorPos)
  })
}

watch(
  () => collab.isConnected,
  (isConnected) => {
    if (isConnected && edit.showComment) {
      fetchComments()
      fetchUsers()
    }
  },
)

watch(
  () => collab.comments,
  () => scrollToBottom(),
  { deep: true },
)

onMounted(() => {
  if (collab.isConnected && edit.showComment) {
    fetchComments()
    fetchUsers()
  }
})
</script>

<style scoped lang="scss">
.toolbar {
  position: fixed;
  bottom: 16px; /* 底部间距营造营造浮空感 */
  left: 60%;
  transform: translateX(-50%); /* 水平居中 */
  min-width: 600px;
  max-width: 900px; /* 限制最大宽度 */
  height: 44px;
  background-color: rgba(255, 255, 255, 0.95); /* 半透明透明背景 */
  border-radius: 8px; /* 圆角增强浮空感 */
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1); /* 多层次层阴影增强立体感 */
  backdrop-filter: blur(8px); /* 背景模糊增强通透感 */
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.12),
      0 2px 4px rgba(0, 0, 0, 0.08); /* 悬停时阴影加深 */
  }
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.left-group {
  margin-right: auto;
}

.right-group {
  margin-left: auto;
}

.middle-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6b7280;
  font-size: 12px;
  width: 160px;
  margin: 0 10px;
  padding: 0 12px;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
}

.middle-info .separator {
  color: #d1d5db;
}

.tool-btn {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-1px); /* 轻微上浮效果 */
  }

  &.active {
    background-color: #e8f3ff;
    color: #2563eb;
  }

  &:active {
    transform: translateY(0);
    background-color: #e0e0e0;
  }
  &:disabled {
    color: #9ca3af; /* 文字颜色变浅 */
    cursor: not-allowed; /* 鼠标样式改为禁止 */
    opacity: 0.7; /* 整体透明度降低 */
    // 禁用hover和active的交互反馈
    &:hover {
      background-color: transparent; /* 取消hover背景色 */
      transform: translateY(0); /* 取消上浮效果 */
    }
    &:active {
      background-color: transparent; /* 取消点击背景色 */
    }
    // 若有active类，禁用选中样式
    &.active {
      background-color: transparent;
      color: #9ca3af;
    }
  }
  .icon {
    width: 100%;
    height: 100%;
  }
}

.zoom-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  background: transparent;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background-color: #e8e8e8;
  }
}

.zoom-input {
  width: 60px;
  margin: 0 3px;

  input {
    width: 100%;
    height: 30px;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
    background: transparent;
    text-align: center;
    font-size: 12px;
    color: #374151;
    outline: none;

    &:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 1px #93c5fd;
    }
  }
}

.separator {
  width: 1px;
  height: 20px;
  background-color: #f0f0f0;
  margin: 0 8px;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .toolbar {
    min-width: auto;
    padding: 0 12px;
  }

  .middle-info {
    margin: 0 8px;
    padding: 0 8px;
  }
}
.comment-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  z-index: 1005;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  &.is-show {
    opacity: 1;
    pointer-events: auto;
  }
}

.comment-panel {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100vh;
  background-color: #fff;
  border-left: 1px solid #f0f0f0;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 1010;
  transition: right 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  display: flex;
  flex-direction: column;

  &.is-show {
    right: 0;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }

  .refresh-icon,
  .close-icon {
    width: 24px;
    height: 24px;
    color: #6b7280;
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: #2563eb;
    }
  }

  .refresh-icon {
    margin-right: 8px;
  }
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  gap: 12px;
  display: flex;
  flex-direction: column;

  .comment-item {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 12px;
    transition: box-shadow 0.15s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    &.resolved {
      opacity: 0.7;
      background-color: #f5f5f5;
    }

    .comment-content {
      font-size: 14px;
      color: #1f2937;
      line-height: 1.5;
      word-wrap: break-word;
      margin-bottom: 8px;
    }

    .comment-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #6b7280;

      .resolve-btn {
        margin-left: auto;
        padding: 4px 8px;
        background-color: #e8f3ff;
        color: #2563eb;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.15s ease;

        &:hover {
          background-color: #dbeafe;
        }
      }
    }
  }

  .no-comments,
  .no-connection {
    text-align: center;
    padding: 40px 0;
    color: #9ca3af;
    font-size: 14px;
  }

  .no-connection {
    color: #ef4444;
  }
}

.comment-input-wrap {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  textarea {
    width: 100%;
    min-height: 80px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    padding: 12px;
    font-size: 14px;
    color: #374151;
    resize: none;
    outline: none;
    transition: border-color 0.15s ease;

    &:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 1px #93c5fd;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  .send-btn {
    align-self: flex-end;
    padding: 8px 16px;
    background-color: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:disabled {
      background-color: #93c5fd;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  }
}

/* @提及列表样式 */
.mention-list {
  position: absolute;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 200px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1015;

  .mention-item {
    padding: 8px 12px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f0f9ff;
    }

    &--active {
      background-color: #e6f7ff;
      color: #2563eb;
    }
  }
}
</style>
