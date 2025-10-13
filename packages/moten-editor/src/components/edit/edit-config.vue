<template>
  <div class="edit-config" ref="target" :class="{ 'is-show': edit.configPanelShow }">
    <div class="icon-group">
      <v-icon
        icon="expand"
        class="icon"
        :content="edit.configPanelShow ? '收起侧边栏' : '展开侧边栏'"
        @click="panelSwitch"
      />
    </div>

    <div class="content">
      <transition-group name="fade">
        <div class="title" v-if="edit.currentSelect?.id">组件</div>
        <div class="title" v-else>页面</div>
        <edit-config-block v-if="edit.currentSelect?.id" />
        <edit-config-page v-else />
        <div class="config-panel">
          <div class="panel-header">
            <el-button size="small" @click="runPerformaceDiagbosis" icon="InfoFilled">
              性能诊断
            </el-button>
          </div>
        </div>
      </transition-group>
      <div class="comment" v-if="collab.isConnected">
        <div class="comment-header">
          <span>评论</span>
          <v-icon
            icon="refresh"
            class="refresh-icon"
            @click="fetchComments"
            title="刷新评论"
          ></v-icon>
        </div>
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
              <button
                v-if="!comment.resolved"
                class="resolve-btn"
                @click="resolveComment(comment.id)"
              >
                √ 解决
              </button>
            </div>
          </div>
          <div v-if="currentComments.length === 0" class="no-comments">暂无评论</div>
        </div>
        <div class="comment-input">
          <textarea
            v-model="newComment"
            placeholder="请输入评论（支持@提及）"
            @keypress.enter.exact.prevent="addNewComment"
            ref="commentTextRef"
            @input="handleInput"
            @keydown="handleKeydown"
            @click="handleClick"
          >
          </textarea>
          <button :disabled="!newComment.trim()" @click="addNewComment" class="send-btn">
            发送
          </button>
        </div>
        <div
          class="mention-list"
          v-if="mentionVisible"
          :style="{ top: mentionPosition.top + 'px', left: mentionPosition.left + 'px' }"
        >
          <div
            class="mention-item"
            v-for="(user, index) in mockUsers"
            :key="index"
            :class="{ 'mention-item--active': index === selectedIndex }"
            @click="selectMention(user)"
          >
            {{ user.username }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PerformanceMonitor } from '@/modules/performance/PerformanceMonitor'
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditStore } from '@/stores/edit'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { nextTick } from 'vue'

const edit = useEditStore()
const collab = useCollaborationStore()

const commentTextRef = ref<HTMLTextAreaElement | null>(null)

const mentionVisible = ref(false)
const mentionPosition = ref({ top: 0, left: 0 })
const mentionQuery = ref('')
const mockUsers = ref<any[]>([])
const newComment = ref('')
const targetId = computed(() => edit.currentSelect!.id || 'PAGE_ROOT')
const selectedIndex = ref(-1)
const commentListRef = ref<HTMLElement | null>(null)

const handleInput = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  const cursorPos = el.selectionStart
  const textBeforeCursor = newComment.value.slice(0, cursorPos)

  const mentionMatch = textBeforeCursor.match(/@\w*$/)
  if (mentionMatch) {
    mentionQuery.value = mentionMatch[0].slice(1)
    if (mockUsers.value.length > 0) {
      showMetionList(el, cursorPos)
    } else {
      mentionVisible.value = false
    }
  } else {
    mentionVisible.value = false
  }
}

const runPerformaceDiagbosis = async () => {
  if (!edit.currentSelect?.id) {
    ElMessage.warning('请选择一个组件进行诊断')
    return
  }
  try {
    const monitor = PerformanceMonitor.getInstance()
    // 开始监听
    monitor.startMonitoringComponent(edit.currentSelect.id)
    forceRerenderCurrentComponent()
    // 等待渲染完成
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))
    // 结束监控并获取报告
    monitor.endMonitoringComponent(edit.currentSelect.id)
    const report = monitor.getReportForComponent(edit.currentSelect.id)
    if (report) {
      showPerformanceReport(report)
    } else {
      ElMessage.warning('没有收集到性能数据,请重试')
    }
  } catch (error) {
    console.error('性能诊断失败', error)
    ElMessage.error('性能诊断失败,请重试')
  }
}

const forceRerenderCurrentComponent = () => {
  const currentKey = (edit.currentSelect as any).key || 0
  edit.currentSelect = {
    ...edit.currentSelect!,
    key: currentKey + 1,
  } as any
}

const showPerformanceReport = (report: any) => {
  ElMessageBox({
    title: '组件性能诊断报告',
    message: `<pre>${JSON.stringify(report, null, 2)}</pre>`,
    dangerouslyUseHTMLString: true,
    showCancelButton: false,
    confirmButtonText: '关闭',
  })
}

const showMetionList = (el: HTMLTextAreaElement, cursorPos: number) => {
  const rect = el.getBoundingClientRect()
  mentionPosition.value = {
    top: rect.bottom + window.screenY,
    left: rect.left + window.screenY,
  }
  mentionVisible.value = true
  selectedIndex.value = -1
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!mentionVisible.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    // TODO
    selectedIndex.value = Math.min(selectedIndex.value + 1, mockUsers.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    // TODO
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectMention(mockUsers.value[0])
  } else if (e.key === 'Escape') {
    mentionVisible.value = false
    selectedIndex.value = -1
  }
}

const handleClick = () => {
  mentionVisible.value = false
  fetchUsers()
  mockUsers.value = collab.userList
  console.log(mockUsers.value)
}

const selectMention = (user: { username: String; id: String }) => {
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
    const newCursorPos = atIndex + user.username.length + 2
    commentTextRef.value?.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (commentListRef.value) {
      commentListRef.value.scrollTop = commentListRef.value.scrollHeight
    }
  })
}

const currentComments = computed(() => {
  return collab.comments
})

const addNewComment = () => {
  if (!newComment.value.trim() || !collab.isConnected) return
  const mentions = [...newComment.value.matchAll(/@(\w+)/g)].map((m) => m[1])
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
  collab.resolveComment(id)
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchComments = () => {
  if (collab.isConnected) {
    collab.fetchComments()
  }
}

const fetchUsers = () => {
  if (collab.isConnected) {
    collab.getAllUsers()
  }
}

const panelSwitch = () => {
  edit.setConfigPanelShow(!edit.configPanelShow)
}

watch(
  () => edit.currentSelect,
  (value) => {
    if (value?.id) edit.setConfigPanelShow(true)
    fetchUsers()
    fetchComments()
  },
  { deep: true },
)
watch(
  () => edit.configPanelShow,
  (value) => {
    if (!value) edit.setCurrentSelect({} as any)
  },
)
watch(
  () => collab.comments,
  () => {
    scrollToBottom()
  },
  { deep: true },
)
onMounted(() => {
  if (collab.isConnected) {
    collab.fetchComments()
  }
})
</script>

<style scoped lang="scss">
.edit-config {
  position: fixed;
  z-index: 200;
  top: var(--edit-header-height);
  right: -280px;
  width: 280px;
  background: white;
  border-left: 1px solid var(--color-border);
  transition: right 0.5s cubic-bezier(1, 0, 0.61, 1.01);
  height: calc(100vh - var(--edit-header-height));

  .comment {
    border-top: 1px solid var(--color-border);
    padding: 12px;
    background: #fafafa;

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: 600;
      font-size: 14px;

      .refresh-icon {
        cursor: pointer;
        font-size: 16px;
        color: #666;

        &:hover {
          color: #007bff;
        }
      }
    }

    .comment-list {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 10px;

      .comment-item {
        background: white;
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 8px;
        font-size: 13px;

        &.resolved {
          opacity: 0.6;
          background: #f9f9f9;

          .resolve-btn {
            display: none;
          }
        }

        .comment-content {
          margin-bottom: 4px;
          word-break: break-word;
        }

        .comment-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #888;

          .resolve-btn {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 12px;
            padding: 0;
          }
        }
      }

      .no-comments {
        color: #999;
        font-size: 13px;
        text-align: center;
        padding: 10px 0;
      }
    }

    .mention-list {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      max-height: 200px;
      overflow-y: auto;
      width: 200px;
    }

    .mention-item {
      padding: 8px 12px;
      cursor: pointer;
      &:hover {
        background: #f0f9ff;
      }
      &--active {
        background: #e6f7ff;
        color: #1890ff;
      }
    }

    .comment-input {
      display: flex;
      gap: 6px;

      textarea {
        flex: 1;
        height: 60px;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: none;
        font-size: 13px;
      }

      .send-btn {
        padding: 0 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }
    }
  }

  &.is-show {
    right: 0;
    transition: right 0.5s cubic-bezier(1, 0, 0.61, 1.01);
  }

  .icon-group {
    position: absolute;
    left: -48px;
    top: 16px;

    .icon {
      cursor: pointer;
      width: 32px;
      height: 32px;
      padding: 3px;
      border-radius: var(--border-radius);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      transition: all 0.2s linear;
      border: 1px solid var(--color-border);
      background: white;

      & + .icon {
        margin-top: 10px;
      }

      &:hover {
        background: var(--color-icon-hover);
        transition: all 0.2s linear;
      }
    }
  }

  .content {
    overflow-y: auto;
    width: 100%;
    height: 100%;
    .config-panel {
      padding: 0 14px 14px 14px;

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0 12px 0;
        border-bottom: 1px solid var(--color-border);

        span {
          font-weight: 600;
        }
      }
    }

    .title {
      padding: 14px;
      font-size: 20px;
      font-weight: 600;
    }

    :deep(.el-tabs--border-card) {
      border: 0;
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
}
</style>
