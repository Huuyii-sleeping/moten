<template>
  <div class="table-config-simple">
    <h2 class="config-title">{{ title }}</h2>

    <!-- 列配置区 -->
    <div class="config-block">
      <div class="block-header">
        <h3>列配置</h3>
        <el-button type="primary" size="small" @click="addColumn" icon="Plus">添加列</el-button>
      </div>

      <el-table :data="tData.columns" border stripe class="config-table">
        <el-table-column prop="prop" label="字段名" width="150">
          <template #default="scope">
            <el-input v-model="scope.row.prop" size="small" placeholder="输入字段名" />
          </template>
        </el-table-column>
        <el-table-column prop="label" label="列标题" width="150">
          <template #default="scope">
            <el-input v-model="scope.row.label" size="small" placeholder="输入标题" />
          </template>
        </el-table-column>
        <el-table-column prop="width" label="宽度" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.width" size="small" placeholder="如 180" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button
              type="text"
              size="small"
              text-color="#ff4d4f"
              @click="deleteColumn(scope.$index)"
              icon="Delete"
              :disabled="tData.columns.length <= 1"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 数据配置区 -->
    <div class="config-block">
      <div class="block-header">
        <h3>表格数据</h3>
        <el-button type="primary" size="small" @click="addRow" icon="Plus">添加行</el-button>
      </div>

      <el-table :data="tData.tableData" border stripe class="config-table">
        <el-table-column
          v-for="col in tData.columns"
          :key="col.prop"
          :label="col.label"
          :width="col.width || 150"
        >
          <template #default="scope">
            <el-input
              v-model="scope.row[col.prop]"
              size="small"
              :placeholder="`输入${col.label}`"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button
              type="text"
              size="small"
              text-color="#ff4d4f"
              @click="deleteRow(scope.$index)"
              icon="Delete"
              :disabled="tData.tableData.length <= 1"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预览区 -->
    <div class="preview-block">
      <h3>表格预览</h3>
      <el-table :data="tData.tableData" border style="width: 100%" :height="250">
        <el-table-column
          v-for="col in tData.columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
        />
      </el-table>
    </div>
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
const emit = defineEmits(['callback', 'update'])
const { data } = toRefs(props)
const { formData, key, id } = data.value
const { title, default: defaultValue } = data.value.properties[props.viewport]
console.log('defaultValue:', defaultValue)
const tData = ref<{
  columns: Array<any>
  tableData: Array<any>
}>({
  columns: defaultValue.columns,
  tableData: defaultValue.tableData,
})
watch(
  () => formData,
  (value) => {
    tData.value = value?.[props.viewport] || defaultValue
  },
)

watch(
  tData,
  (value) => {
    let data = {}
    console.log('tdata:', value)
    const _value = value || { column: [], tableData: [] }
    if (Object.values(formData || {}).length < 2) {
      data = { desktop: _value, mobile: _value }
    } else {
      data = { [props.viewport]: _value }
    }
    emit('callback', {
      data: {
        [key]: data,
      },
      id,
    })
  },
  { immediate: true, deep: true },
)

const addColumn = () => {
  const newProp = `field${tData.value.columns.length + 1}`
  tData.value.columns.push({
    prop: newProp,
    label: `新列${tData.value.columns.length + 1}`,
    width: '150',
  })
  // 给所有数据行添加新字段
  tData.value.tableData.forEach((row: any) => (row[newProp] = ''))
}

// 删除列：同步删除所有数据行的对应字段
const deleteColumn = (index: number) => {
  const delProp = tData.value.columns[index].prop
  tData.value.columns.splice(index, 1)
  tData.value.tableData.forEach((row: any) => delete row[delProp])
}

// 添加行：自动包含所有列的字段
const addRow = () => {
  const newRow: Record<string, string> = {}
  tData.value.columns.forEach((col: any) => (newRow[col.prop] = ''))
  tData.value.tableData.push(newRow)
}

// 删除行
const deleteRow = (index: number) => {
  tData.value.tableData.splice(index, 1)
}
</script>

<style scoped lang="scss">
.table-config-simple {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.config-title {
  text-align: center;
  color: #1e293b;
  margin-bottom: 25px;
}

.config-block {
  margin-bottom: 25px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 6px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  h3 {
    margin: 0;
    color: #334155;
    font-size: 16px;
  }
}

.config-table {
  width: 100%;
  background: #fff;
}

.preview-block {
  padding: 15px;
  background: #f8fafc;
  border-radius: 6px;
  h3 {
    margin: 0 0 15px 0;
    color: #334155;
    font-size: 16px;
  }
}
</style>
