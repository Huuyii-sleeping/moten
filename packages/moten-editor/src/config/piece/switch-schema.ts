import { type Static, Type } from 'typebox'
import { schemaAllViewport } from '@moten/ui'

const loading = Type.Boolean({
  code: 'config-selcet',
  title: '加载状态',
})
const size = Type.String({
  code: 'config-dropdown',
  title: '尺寸',
  select: ['small', 'default', 'large'],
  default: '',
})

const width = Type.String({
  code: 'config-input',
  title: '宽度',
})

const content = Type.Boolean({
  code: 'config-select',
  title: '选择',
  default: false,
})

const disabled = Type.Boolean({
  code: 'config-select',
  title: '是否禁用',
  default: false,
})

const activeColor = Type.String({
  code: 'config-color',
  title: '激活状态下的颜色',
})

const inactiveColor = Type.String({
  code: 'config-color',
  title: '非激活状态下的颜色',
})

const T = Type.Object({
  loading: schemaAllViewport(loading),
  content: schemaAllViewport(content),
  size: schemaAllViewport(size),
  width: schemaAllViewport(width),
  disabled: schemaAllViewport(disabled),
  'active-color': schemaAllViewport(activeColor),
  'inactive-color': schemaAllViewport(inactiveColor),
})

export type switchSchema = Static<typeof T>

export default T
