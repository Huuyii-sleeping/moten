<template>
  <div class="edit-config-block">
    <edit-config-render :list="list" :schema="schema" @callback="callback">
      <div v-if="edit.currentSelect?.id">
        <el-empty description="请在左侧拖入组件后，点击选中组件">
          <template #image>
            <v-icon icon="dragBlank" class="icon" />
          </template>
        </el-empty>
      </div>
    </edit-config-render>
  </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit'
import { ref, watch } from 'vue'
import { blockSchema, type BlockSchema, type BlockSchemaKeys } from '@/config/schema'
import { findNodeById } from './utils/nested'
import deepmerge from 'deepmerge'
const edit = useEditStore()
const list = ref<any[]>([])
const schema = ref<BlockSchema[BlockSchemaKeys]>()

watch(
  () => edit.currentSelect,
  () => {
    const code = edit.currentSelect?.code as BlockSchemaKeys
    const properties = blockSchema[code]?.properties
    if (!edit.currentSelect || !properties) {
      list.value = []
      return
    }
    schema.value = blockSchema[code] // 拿到对应组件的schema
    const { formData, id } = edit.currentSelect as any
    const listResult = Object.fromEntries(
      Object.entries(properties).map((itemChild) => {
        const [key, value] = itemChild as any
        return [key, { ...value, id, key, formData: formData?.[key] || {} }]
      }),
    )
    list.value = [...Object.values(listResult)]
  },
  { immediate: true, deep: true },
)

const callback = (params: { data: object; id: string }) => {
  const { data, id } = params
  if (!id) return
  const blockConfig = edit.blockConfig || []
  const newBlockConfig = findNodeById(blockConfig, id, (params: any) => {
    let { array, index, node } = params
    const overwriteMerge = (_destinationArray: any, sourceArray: any, _options: any) => sourceArray
    array[index].formData = deepmerge(node.formData, data, {
      arrayMerge: overwriteMerge,
    })

    // 下面的作用就是将对应children的值进行设置操作 每个column因该有自己对应的children。用来放置
    // children  的更新
    if (node.nested && node.code === 'column') {
      const cols = node.formData?.cols?.desktop || [0.5, 0.5]
      const oldCols = node.children || [[], []]
      if (oldCols.length > cols.length) {
        const count = oldCols.length - cols.length
        array[index].children?.splice(oldCols.length - count, count)
      } else {
        const count = cols.length - oldCols.length
        const diff = Array.from({ length: count }, (_) => [])
        array[index].children?.push(...diff)
      }
    } else if (node.nested && node.code === 'row') {
      const rows = node.formData?.rows?.desktop || [0.5, 0.5]
      const oldRows = node.children || [[], []]
      if (oldRows.length > rows.length) {
        const count = oldRows.length - rows.length
        array[index].children?.splice(oldRows.length - count, count)
      } else {
        const count = rows.length - oldRows.length
        const diff = Array.from({ length: count }, (_) => [])
        array[index].children?.push(...diff)
      }
    }
  })

  edit.setBlockConfig(newBlockConfig)
}
</script>

<style scoped lang="scss">
.edit-config-block {
  width: 100%;
}
</style>
