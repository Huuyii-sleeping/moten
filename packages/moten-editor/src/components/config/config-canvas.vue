<template>
    02943049234923-049320-49320-
  <div class="canvas-config">
    <!-- 宽度配置 -->
    <el-form-item :label="widthConfig.title" :prop="key + '.width.' + viewport">
      <el-input-number
        v-model="width"
        :min="100"
        :max="2000"
        :step="10"
        :placeholder="widthConfig.placeholder"
        class="input"
      ></el-input-number>
    </el-form-item>

    <!-- 高度配置 -->
    <el-form-item :label="heightConfig.title" :prop="key + '.height.' + viewport">
      <el-input-number
        v-model="height"
        :min="100"
        :max="2000"
        :step="10"
        :placeholder="heightConfig.placeholder"
        class="input"
      ></el-input-number>
    </el-form-item>

    <!-- 背景色配置 -->
    <el-form-item :label="bgColorConfig.title" :prop="key + '.bgColor.' + viewport">
      <el-color-picker
        v-model="bgColor"
        :placeholder="bgColorConfig.placeholder"
        class="color-picker"
      ></el-color-picker>
    </el-form-item>

    <!-- 线条颜色配置 -->
    <el-form-item :label="lineColorConfig.title" :prop="key + '.lineColor.' + viewport">
      <el-color-picker
        v-model="lineColor"
        :placeholder="lineColorConfig.placeholder"
        class="color-picker"
      ></el-color-picker>
    </el-form-item>

    <!-- 线条宽度配置 -->
    <el-form-item :label="lineWidthConfig.title" :prop="key + '.lineWidth.' + viewport">
      <el-input-number
        v-model="lineWidth"
        :min="1"
        :max="20"
        :step="1"
        :placeholder="lineWidthConfig.placeholder"
        class="input"
      ></el-input-number>
    </el-form-item>

    <!-- 是否显示网格 -->
    <el-form-item :label="showGridConfig.title" :prop="key + '.showGrid.' + viewport">
      <el-switch v-model="showGrid" active-text="显示" inactive-text="隐藏"></el-switch>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'

// 定义组件接收的props
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      formData: {},
      id: '',
      properties: {
        desktop: {
          width: { title: '画布宽度', default: 800, placeholder: '请输入画布宽度' },
          height: { title: '画布高度', default: 600, placeholder: '请输入画布高度' },
          bgColor: { title: '背景颜色', default: '#ffffff', placeholder: '请选择背景色' },
          lineColor: { title: '线条颜色', default: '#000000', placeholder: '请选择线条颜色' },
          lineWidth: { title: '线条宽度', default: 2, placeholder: '请输入线条宽度' },
          showGrid: { title: '显示网格', default: false },
        },
        mobile: {
          width: { title: '画布宽度', default: 375, placeholder: '请输入画布宽度' },
          height: { title: '画布高度', default: 667, placeholder: '请输入画布高度' },
          bgColor: { title: '背景颜色', default: '#ffffff', placeholder: '请选择背景色' },
          lineColor: { title: '线条颜色', default: '#000000', placeholder: '请选择线条颜色' },
          lineWidth: { title: '线条宽度', default: 2, placeholder: '请输入线条宽度' },
          showGrid: { title: '显示网格', default: false },
        },
      },
    }),
  },
  viewport: {
    type: String,
    default: 'desktop',
  },
})

// 定义事件发射器
const emit = defineEmits(['callback'])

// 解构props数据
const { data, viewport } = toRefs(props)
const { formData, key, id } = data.value
const properties = data.value.properties[viewport.value]

// 配置项的默认值
const widthConfig = properties.width
const heightConfig = properties.height
const bgColorConfig = properties.bgColor
const lineColorConfig = properties.lineColor
const lineWidthConfig = properties.lineWidth
const showGridConfig = properties.showGrid

// 响应式变量
const width = ref<number>(0)
const height = ref<number>(0)
const bgColor = ref<string>('')
const lineColor = ref<string>('')
const lineWidth = ref<number>(0)
const showGrid = ref<boolean>(false)

// 初始化数据并监听formData变化
watch(
  () => formData,
  (value) => {
    width.value = value?.width?.[viewport.value] || widthConfig.default
    height.value = value?.height?.[viewport.value] || heightConfig.default
    bgColor.value = value?.bgColor?.[viewport.value] || bgColorConfig.default
    lineColor.value = value?.lineColor?.[viewport.value] || lineColorConfig.default
    lineWidth.value = value?.lineWidth?.[viewport.value] || lineWidthConfig.default
    showGrid.value = value?.showGrid?.[viewport.value] ?? showGridConfig.default
  },
  { immediate: true },
)

// 统一的更新处理函数
const handleUpdate = (field: string, value: any) => {
  let data: Record<string, any> = {}

  // 当数据不完整时，同步更新所有视图
  if (Object.values(formData || {}).length < 2) {
    data = {
      desktop: value,
      mobile: value,
    }
  } else {
    data = { [viewport.value]: value }
  }

  // 发射回调事件
  emit('callback', {
    data: {
      [key]: {
        ...(formData as any),
        [field]: data,
      },
    },
    id,
  })
}

// 监听各个配置项的变化
watch(width, (value) => handleUpdate('width', value))
watch(height, (value) => handleUpdate('height', value))
watch(bgColor, (value) => handleUpdate('bgColor', value))
watch(lineColor, (value) => handleUpdate('lineColor', value))
watch(lineWidth, (value) => handleUpdate('lineWidth', value))
watch(showGrid, (value) => handleUpdate('showGrid', value))
</script>

<style scoped lang="scss">
.canvas-config {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  :deep(.el-form-item) {
    margin-bottom: 8px;
  }

  :deep(.el-input-number) {
    width: 100%;
  }

  :deep(.el-input__wrapper),
  :deep(.el-color-picker__trigger) {
    background: var(--color-config-block-bg);
  }

  .color-picker {
    width: 100%;
  }

  :deep(.el-switch) {
    margin-top: 5px;
  }
}
</style>
