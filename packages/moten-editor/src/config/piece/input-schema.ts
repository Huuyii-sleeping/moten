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

const T = Type.Object({
  placeholder: schemaAllViewport(placeholder),
  content: schemaAllViewport(content),
  type: schemaAllViewport(type),
  clearable: schemaAllViewport(clearable),
  'show-password': schemaAllViewport(showPassword),
})

export type buttonSchema = Static<typeof T>

export default T
