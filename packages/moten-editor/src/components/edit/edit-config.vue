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
            placeholder="请输入评论"
            @keypress.enter.exact.prevent="addNewComment"
          >
          </textarea>
          <button :disabled="!newComment.trim()" @click="addNewComment" class="send-btn">
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useEditStore } from '@/stores/edit'
import { computed, onMounted, ref, watch } from 'vue'
import { nextTick } from 'vue'

const edit = useEditStore()
const collab = useCollaborationStore()

const newComment = ref('')
const targetId = computed(() => edit.currentSelect!.id || 'PAGE_ROOT')

const commentListRef = ref<HTMLElement | null>(null)

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

const fetchComments = () => {
  if (collab.isConnected) {
    collab.fetchComments()
  }
}

const addNewComment = () => {
  if (!newComment.value.trim() || !collab.isConnected) return
  collab.addCommment({
    componentId: targetId.value,
    content: newComment.value.trim(),
    authorName: '当前用户',
    position: { x: 0, y: 0 },
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

const panelSwitch = () => {
  edit.setConfigPanelShow(!edit.configPanelShow)
}
watch(
  () => edit.currentSelect,
  (value) => {
    if (value?.id) edit.setConfigPanelShow(true)
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
