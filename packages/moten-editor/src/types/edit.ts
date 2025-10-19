import type { BlockSchema, BlockSchemaKeys, PageSchemaFormData } from '@/config/schema'

export type Viewport = 'mobile' | 'desktop'
export interface BaseBlock {
  // id 区分组件
  id: string
  // 组件名字
  code: string
  // 物料区标题
  name: string
  // 物料区图标
  icon?: string
  // 是否是嵌套组件
  nested?: boolean
  // 嵌套子项
  children?: BaseBlock[][]
  // 配置内容
  formData?: Partial<BlockSchema[BlockSchemaKeys] | Object>
  // 区分内容
  type?: string

  x?: number

  y?: number

  width?: number

  height?: number
}

export interface ElementBlock {
  id: string
  code: string
  name: string
  icon?: string
  nested?: boolean
  formData?: Object
  style?: Record<string, any>
  type?: string
}

export type BasePage = PageSchemaFormData

export type BaseBlockNull = BaseBlock | null

