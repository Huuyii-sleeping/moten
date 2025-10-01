import { schema } from '@moten/ui'
import _pageSchema, { type PageSchema } from './page-schema'
import buttonSchema from './piece/button-schema'

schema.ElButton = buttonSchema

export type BlockSchema = typeof schema

export type BlockSchemaKeys = keyof BlockSchema

export type PageSchemaFormData = PageSchema

export const blockSchema = schema

export const pageSchema = _pageSchema

// export
