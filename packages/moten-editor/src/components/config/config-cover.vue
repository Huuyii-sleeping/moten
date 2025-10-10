<template>
  <div class="config-input">
    <el-form-item :label="title" :prop="key + '.' + viewport">
      <input
        type="file"
        accept="image/*"
        ref="fileInput"
        class="hidden"
        @change="handleImageSelect"
      />
      <el-button @click="fileInput.click()" class="upload-btn">
        {{ '选择图片' }}
      </el-button>
      <div v-if="imageCover" class="image-preview">
        <img :src="imageCover" alt="" class="preview-img" />
      </div>
      <div v-else class="empty-tip">暂无图片</div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { useEditStore } from '@/stores/edit'
import { onUnmounted, ref, toRefs, watch } from 'vue'

const edit = useEditStore()
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
const { title, default: defaultValue, placeholder } = data.value.properties[props.viewport]
const imageCover = ref('')
const preimage = ref()
const fileInput = ref()

const handleImageSelect = (e: any) => {
  const selectedFiles = e.target.files
  if (!selectedFiles) return
  Array.from(selectedFiles).forEach((file: any) => {
    // if (!file.type.startsdWith('image/')) return
    preimage.value = file
    const previewUrl = URL.createObjectURL(file)
    imageCover.value = previewUrl
  })
  e.target.value = ''
}

watch(preimage, (value) => {
  edit.setPageCover(value)
})

watch(
  () => formData,
  (value) => {
    imageCover.value = value?.[props.viewport] || defaultValue
  },
  { immediate: true },
)

watch(
  imageCover,
  (value) => {
    let data = {}
    const _value = value || []
    if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
    else data = { [props.viewport]: _value }

    emit('callback', {
      data: {
        [key]: data,
      },
      id,
    })
  },
  { immediate: true, deep: true },
)

onUnmounted(() => {
  imageCover.value = ''
})
</script>

<style scoped lang="scss">
.hidden {
  display: none;
  /* 隐藏原生 input，用自定义按钮触发 */
}

.upload-btn {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 16px;
}

.image-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.image-item {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 保持图片比例，填满容器 */
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.empty-tip {
  color: #999;
  margin: 0;
}
</style>
