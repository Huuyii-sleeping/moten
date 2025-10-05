import { type Static, Type } from 'typebox'
import { schemaAllViewport } from '@moten/ui'

const placeholder = Type.String({
  code: 'config-input',
  title: '占位内容',
  placeholder: '请输入内容',
})
const clearable = Type.String({
  code: 'config-select',
  title: '一键清除',
  default: true,
})

const type = Type.String({
  code: 'config-dropdown',
  title: '类型',
  select: ['text', 'textarea', 'password', 'file'],
  default: 'text',
})

const showPassword = Type.Boolean({
  code: 'config-select',
  title: '展示内容',
  default: true,
})

const content = Type.Boolean({
  code: 'config-input',
  title: '内容',
  placeholder: '请输入内容',
  default: '',
})

const maxLength = Type.String({
  code: 'config-input',
  title: '最大长度',
})

const minLength = Type.String({
  code: 'config-input',
  title: '最小长度',
})

const showWordLimit = Type.Boolean({
  code: 'config-select',
  title: '是否显示统计字数',
  default: false,
})

const disabled = Type.Boolean({
  code: 'config-select',
  title: '是否禁用',
  default: false,
})


const T = Type.Object({
  placeholder: schemaAllViewport(placeholder),
  content: schemaAllViewport(content),
  type: schemaAllViewport(type),
  clearable: schemaAllViewport(clearable),
  'show-password': schemaAllViewport(showPassword),
  maxLength: schemaAllViewport(maxLength),
  minLength: schemaAllViewport(minLength),
  'show-word-limit': schemaAllViewport(showWordLimit),
  disabled: schemaAllViewport(disabled),
})

export type buttonSchema = Static<typeof T>

export default T
