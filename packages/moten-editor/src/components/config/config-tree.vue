<template>
  <div class="config-list">
    <div class="list-header">
      <div class="list-title">{{ title }}</div>
      <el-button type="primary" size="small" @click="handleAddRootItem" class="add-btn" icon="Plus">
        添加根节点
      </el-button>
    </div>

    <!-- 使用 el-tree 替代 el-table -->
    <el-tree
      v-if="treeData.length > 0"
      :data="treeData"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :props="{ children: 'children', label: 'content' }"
      class="editable-tree"
    >
      <!-- 自定义节点内容 -->
      <template #default="{ node, data }">
        <div class="tree-node-content">
          <!-- 内容输入框 -->
          <el-input
            v-model="data.content"
            size="small"
            placeholder="请输入内容"
            :disabled="data.disabled"
            class="content-input"
            style="width: 160px"
          />

          <!-- 禁用开关 -->
          <el-switch
            v-model="data.disabled"
            size="small"
            active-text="禁用"
            inactive-text="启用"
            style="margin: 0 12px"
          />

          <!-- 操作按钮组 -->
          <div class="node-actions">
            <el-button
              type="text"
              size="small"
              @click="handleAddChild(data)"
              icon="Plus"
              title="添加子项"
            />
            <el-button
              type="text"
              size="small"
              @click="handleDeleteNode(node)"
              icon="Delete"
              :disabled="treeData.length <= 1 && !data.children?.length"
              style="color: #ff4d4f"
            />
          </div>
        </div>
      </template>
    </el-tree>

    <el-empty v-else description="暂无数据" class="empty-state" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref, toRefs, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  viewport: {
    type: String,
    default: 'desktop',
  },
})
const emit = defineEmits(['callback'])
const { data } = toRefs(props)
const { formData, key, id } = data.value
const { title, default: defaultValue } = data.value.properties[props.viewport]
// 添加唯一id用来展示
const addToTree = (list: any[], parentId: string | null = null): any[] => {
  return list.map((item, index) => {
    const id = parentId ? `${parentId}-${index}` : `root-${index}`
    return {
      ...item,
      id,
      children: item.children ? addToTree(item.children, id) : undefined,
    }
  })
}
// 从tree中的数据移除id（保存时）
const removeIdFromTree = (list: any[]): any[] => {
  return list.map(({ id, children, ...rest }) => ({
    ...rest,
    ...(children ? { children: removeIdFromTree(children) } : {}),
  }))
}
const treeData = ref<any[]>([])
// 添加根节点
const handleAddRootItem = () => {
  treeData.value.push({
    id: `root-${Date.now()}`,
    content: '',
    disabled: false,
  })
}
// 添加子节点
const handleAddChild = (parentNode: any) => {
  if (!parentNode) {
    parentNode.children = []
  }
  parentNode.children.push({
    id: `${parentNode.id}-${parentNode.children.length}`,
    content: '',
    disabled: false,
  })
}
// 删除节点
const handleDeleteNode = (node: any) => {
  if (treeData.value.length <= 1 && !node.parent?.children?.length) {
    ElMessage.warning('至少保留一个根节点')
    return
  }
  const deleteRecursive = (list: any[], targetId: string): boolean => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === targetId) {
        list.splice(i, 1)
        return true
      }
      if (list[i].children && deleteRecursive(list[i].children, targetId)) {
        return true
      }
    }
    return false
  }
  deleteRecursive(treeData.value, node.data.id)
}
watch(
  () => formData?.[props.viewport] || defaultValue,
  (value) => {
    if (value && Array.isArray(value)) {
      treeData.value = addToTree(value)
    } else {
      treeData.value = addToTree(defaultValue || [])
    }
  },
  {
    immediate: true,
  },
)
watch(
  treeData,
  (newVal) => {
    const cleaned = removeIdFromTree(newVal)
    const payload =
      Object.keys(formData || {}).length < 2
        ? { desktop: cleaned, mobile: cleaned }
        : { [props.viewport]: cleaned }

    emit('callback', {
      data: {
        [key]: payload,
      },
      id,
    })
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<style scoped lang="scss">
// 容器整体样式：卡片化设计，增强层次感
.config-list {
  width: 500px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

// 表头：标题+按钮布局
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f3f5;
}

// 标题样式
.list-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

// 添加根节点按钮：hover反馈优化
.add-btn {
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  transition: all 0.2s ease;
}

// 树形组件：间距与选中态优化
.editable-tree {
  // 修复Element树节点默认间距
  :deep(.el-tree-node) {
    padding: 4px 0;

    // 嵌套节点缩进：增强层级感
    &:not(:first-child) {
      margin-left: 16px;
    }

    // 选中节点背景：弱化选中态，避免与操作区冲突
    &.is-current > .el-tree-node__content {
      background-color: #f7f8fa;
    }

    // 节点内容区：消除默认padding，自定义布局
    .el-tree-node__content {
      padding: 0;
      height: auto;
      min-height: 32px;
      align-items: center;
    }
  }

  // 隐藏树节点默认图标（用自定义操作按钮替代）
  :deep(.el-tree-node__expand-icon) {
    margin-right: 6px;
    color: #c9cdcf;
    &:hover {
      color: #409eff;
    }
  }
}

// 节点内容区：输入框+开关+按钮布局
.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 2px 0;
}

// 内容输入框：聚焦态优化
.content-input {
  :deep(.el-input__inner) {
    border-color: #e5e6eb;
    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
    &:disabled {
      background-color: #f7f8fa;
      color: #86909c;
      cursor: not-allowed;
    }
  }
}

// 操作按钮组：hover与禁用态优化
.node-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f2f3f5;
  }

  // 禁用删除按钮样式
  &.delete-btn:disabled {
    color: #c9cdcf !important;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
    }
  }
}

// 空状态：居中与间距优化
.empty-state {
  padding: 48px 0;
  :deep(.el-empty__image) {
    width: 80px;
    height: 80px;
  }
  :deep(.el-empty__description) {
    color: #86909c;
    font-size: 13px;
    margin-top: 12px;
  }
}
</style>
