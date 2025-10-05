import { schema } from '@moten/ui'
import _pageSchema, { type PageSchema } from './page-schema'
import buttonSchema from './piece/button-schema'
import inputSchema from './piece/input-schema'
import switchSchema from './piece/switch-schema'
import slideSchema from './piece/slide-schema'
schema.ElButton = buttonSchema
schema.ElInput = inputSchema
schema.ElSwitch = switchSchema
schema.ElSlide = slideSchema

export type BlockSchema = typeof schema

export type BlockSchemaKeys = keyof BlockSchema

export type PageSchemaFormData = PageSchema

export const blockSchema = schema

export const pageSchema = _pageSchema

// export
