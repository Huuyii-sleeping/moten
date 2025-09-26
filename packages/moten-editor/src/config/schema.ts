import { schema } from '@moten/ui'

export type BlockSchema = typeof schema

export type BlockSchemaKeys = keyof BlockSchema

export const blockSchema = schema