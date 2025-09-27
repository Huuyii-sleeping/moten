import { schema } from '@moten/ui'
import _pageSchema, { type PageSchema } from './page-schema'

export type BlockSchema = typeof schema

export type BlockSchemaKeys = keyof BlockSchema

export type PageSchemaFormData = PageSchema

export const blockSchema = schema

export const pageSchema = _pageSchema