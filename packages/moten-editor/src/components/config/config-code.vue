<template>
  <div class="config-code">
    <label v-if="label" class="config-code-label">{{ label }}</label>
    <div class="monaco-editor-container" ref="editorContainer"></div>
    <div class="config-code-description" v-if="description">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === 'javascript' || label === 'typescript') {
        return new URL(
          'monaco-editor/esm/vs/language/typescript/ts.worker.js',
          import.meta.url,
        ).toString()
      }
      if (label === 'json') {
        return new URL(
          'monaco-editor/esm/vs/language/json/json.worker.js',
          import.meta.url,
        ).toString()
      }
      return new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url).toString()
    },
  }
}
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
const { title, default: defaultValue, placeholder } = data.value
let monaco: any = null
let editor: any = null
const label = computed(() => title)
const description = computed(() => placeholder)
const editorContainer = ref<HTMLElement | null>(null)
const input = ref('')
const initMonaco = async () => {
  if (typeof (window as any).monaco === 'undefined') {
    const monacoModule = await import('monaco-editor')
    monaco = monacoModule
    await import('monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution')
    await import('monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution')
  } else {
    monaco = (window as any).monaco
  }
  if (!editorContainer.value) return
  editor = monaco.editor.create(editorContainer.value, {
    value: input.value || '',
    language: 'javascript',
    theme: 'vs', // vs, vs-dark, hc-black
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastColumn: 20,
    wordWrap: 'on',
    tabSize: 2,
    // readOnly: props.disabled,
    glyphMargin: false,
    folding: false,
    renderLineHighlight: 'none',
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    renderOverviewRuler: false,
    lineNumbersMinChars: 3,
    padding: { top: 10, bottom: 10, left: 5, right: 10 },
  })
  editor.onDidChangeModelContent(() => {
    const newValue = editor.getValue()
    input.value = newValue
  })
}
const disposeEditor = () => {
  if (editor) {
    editor.dispose()
    editor = null
  }
}
watch(
  () => formData,
  (value) => {
    input.value = value?.[props.viewport] || defaultValue
  },
)
watch(
  input,
  (value) => {
    let data = {}
    const _value = value || ''
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
  { immediate: true },
)
onMounted(() => {
  initMonaco()
})
onBeforeUnmount(() => {
  disposeEditor()
})
</script>

<style scoped lang="scss">
.config-code {
  width: 100%;

  .config-code-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  .monaco-editor-container {
    width: 100%;
    height: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }

  .config-code-description {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
}
:deep(.monaco-editor .suggest-widget) {
  left: 10px !important;
}
:deep(.monaco-editor .suggest-widget.visible) {
  transform: translateX(5px);
}
</style>
