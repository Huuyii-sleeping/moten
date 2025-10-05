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

const plain = Type.Boolean({
  code: 'config-select',
  title: '是否是朴素按钮',
  default: false,
})

const text = Type.Boolean({
  code: 'config-select',
  title: '是否是文字按钮',
  default: false,
})

const bg = Type.Boolean({
  code: 'config-select',
  title: '是否显示背景颜色',
  default: false,
})

const link = Type.Boolean({
  code: 'config-select',
  title: '是否是链接按钮',
  default: false,
})

const round = Type.Boolean({
  code: 'config-select',
  title: '是否为圆角按钮',
  default: false,
})

const circle = Type.Boolean({
  code: 'config-select',
  title: '是否为圆形按钮',
  default: false,
})

const loading = Type.Boolean({
  code: 'config-select',
  title: '是否为加载中状态',
  default: false,
})

const disabled = Type.Boolean({
  code: 'config-select',
  title: '按钮是否为禁用状态',
  default: false,
})

const T = Type.Object({
  type: schemaAllViewport(type),
  content: schemaAllViewport(content),
  size: schemaAllViewport(size),
  plain: schemaAllViewport(plain),
  round: schemaAllViewport(round),
  circle: schemaAllViewport(circle),
  loading: schemaAllViewport(loading),
  disabled: schemaAllViewport(disabled),
  text: schemaAllViewport(text),
  link: schemaAllViewport(link),
  bg: schemaAllViewport(bg),
})

export type buttonSchema = Static<typeof T>

export default T
