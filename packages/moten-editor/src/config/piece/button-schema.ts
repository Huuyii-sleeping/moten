import { type Static, Type } from 'typebox'
import { schemaAllViewport } from '@moten/ui'

const type = Type.String({
  code: 'config-input',
  title: '按钮种类',
  default: 'primary',
})
const content = Type.String({
  code: 'config-input',
  title: '内容',
  placeholder: '请输入按钮内容',
  default: '按钮',
})

const size = Type.String({
  code: 'config-dropdown',
  title: '按钮大小',
  select: ['small', 'default', 'large'],
  default: '',
})

const T = Type.Object({
  type: schemaAllViewport(type),
  content: schemaAllViewport(content),
  size: schemaAllViewport(size),
})

export type buttonSchema = Static<typeof T>

export default T
