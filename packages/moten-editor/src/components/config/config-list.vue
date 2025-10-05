<template>
  <div class="config-list">
    <div class="list-header">
      <div class="list-header">{{ title }}</div>
      <el-button
        type="primary"
        size="small"
        @click="handleAddItem"
        class="add-btn"
        icon="Plus"
      ></el-button>
    </div>
    <el-table
      :data="list"
      border
      stripe
      :show-header="false"
      class="list-table"
      :cell-style="{ padding: '12px 16px' }"
      style="width: 400px"
    >
      <el-table-column prop="content" width="150px">
        <template #default="scope">
          <el-input
            v-model="scope.row.content"
            size="small"
            placeholder="请输入内容"
            :disabled="scope.row.disabled"
            class="content-input"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column width="100px">
        <template #default="scope">
          <el-switch
            v-model="scope.row.disabled"
            size="small"
            active-text="禁用"
            inactive-text="启用"
          />
        </template>
      </el-table-column>
      <el-table-column width="100px">
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            text-color="#ff4d4f"
            @click="handleDeleteItem(scope.$index)"
            icon="Delete"
            :disabled="list.length <= 1"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!list || list.length === 0" description="暂无数据" class="empty-state" />
  </div>
</template>

<script setup lang="ts">
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
const list = ref<any>([])

const handleAddItem = () => {
  console.log('添加')
  list.value.push({
    content: '',
    disabled: false,
  })
}

const handleDeleteItem = (index: number) => {
  list.value.splice(index, 1)
}

watch(
  () => formData,
  (value) => {
    list.value = value?.[props.viewport] || defaultValue
  },
  { immediate: true },
)
watch(
  list,
  (value) => {
    let data = {}
    const _value = value || ''
    if (Object.values(formData || {}).length < 2) {
      data = { desktop: _value, mobile: _value }
    } else {
      data = { [props.viewport]: _value }
    }
    console.log(data)
    emit('callback', {
      data: {
        [key]: data,
      },
      id,
    })
  },
  { immediate: true, deep: true },
)
</script>

<style scoped lang="scss">
.config-list {
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.list-manager-container:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.add-btn {
  transition: transform 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
}

.list-table {
  border-radius: 6px;
  overflow: hidden;
}

.content-input {
  width: 100%;
}

.empty-state {
  padding: 40px 0;
}

/* 禁用状态样式 */
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f9fafb;
  color: #94a3b8;
}
</style>
