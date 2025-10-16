<template>
  <div class="config-files">
    <el-form-item :label="title" :prop="key + '.' + viewport">
      <img v-if="src" :src="src" class="image" id="image" @click="triggerFileInput" crossorigin="anonymous"/>
      <div v-else class="file" @click="triggerFileInput">
        <v-icon icon="upload" class="icon" />
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />
      <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, toRefs, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/utils'
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
const src = ref('')
const fileInput = ref<HTMLElement | null>(null)
const uploadError = ref('')

watch(
  () => formData,
  (value) => {
    src.value = value?.[props.viewport] || defaultValue
  },
  {
    immediate: true,
  },
)

watch(
  src,
  (value) => {
    let data = {}
    const _value = value || ''
    if (Object.values(formData || {}).length < 2) data = { desktop: _value, mobile: _value }
    else data = { [props.viewport]: _value }
    emit('callback', {
      data: {
        [key]: data,
      },
      id,
    })
    emit('update', {
      [key]: data,
    })
  },
  {
    immediate: true,
  },
)

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }
  if (!file.type.startsWith('image/')) {
    uploadError.value = '请上传图片文件'
    ElMessage.error('请上传图片文件')
    return
  }
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = '图片大小不能超过 5MB'
    ElMessage.error('图片大小不能超过 5MB')
    return
  }
  try {
    const truthUrl = await uploadImage(file)
    src.value = `http://localhost:8081${truthUrl}`
    uploadError.value = ''
    if (fileInput.value) {
      fileInput.value = null
    }
  } catch (error) {
    console.error('文件上传失败，请重试')
    ElMessage.error('上传失败，请重试')
    src.value = formData?.[props.viewport] || defaultValue
  }
}
onUnmounted(() => {
  if (src.value && src.value.startsWith('blob')) {
    URL.revokeObjectURL(src.value)
  }
})
</script>

<style lang="scss" scoped>
.config-files {
  .file,
  .image {
    width: 80px;
    height: 80px;
    box-shadow: 0 0 0 1px var(--color-border) inset;
    border-radius: var(--border-radius);
    background: var(--color-config-block-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .is-error {
    .file,
    .image {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }

  .image {
    border: 0;
    width: 82px;
    height: 82px;
    object-fit: cover;
  }

  .icon {
    width: 26px;
    height: 26px;
  }
}
</style>
