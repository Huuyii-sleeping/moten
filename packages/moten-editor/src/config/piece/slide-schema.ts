import { type Static, Type } from 'typebox'
import { schemaAllViewport } from '@moten/ui'

const content = Type.Number({
  code: 'config-input',
  title: '绑定值',
  default: 0,
})

const min = Type.Number({
  code: 'config-input',
  title: '最小值',
  default: 0,
})

const max = Type.Number({
  code: 'config-input',
  title: '最大值',
  default: 10,
})

const disabled = Type.Boolean({
  code: 'config-select',
  title: '是否禁用',
  default: false,
})

const step = Type.Number({
  code: 'config-input',
  title: '步长',
})

const showInput = Type.Boolean({
  code: 'config-select',
  title: '是否显示输入框',
  default: false,
})

const showStops = Type.Boolean({
  code: 'config-select',
  title: '是否显示断点',
  default: false,
})

const vertical = Type.Boolean({
  code: 'config-select',
  title: '垂直模式',
  default: false,
})

const T = Type.Object({
  content: schemaAllViewport(content),
  min: schemaAllViewport(min),
  max: schemaAllViewport(max),
  disabled: schemaAllViewport(disabled),
  step: schemaAllViewport(step),
  'show-input': schemaAllViewport(showInput),
  'show-stops': schemaAllViewport(showStops),
  vertical: schemaAllViewport(vertical),
})

export type switchSchema = Static<typeof T>

export default T
