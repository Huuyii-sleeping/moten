import type { BaseBlock } from '@/types/edit'

export type BlockOperation =
  | { op: 'add'; block: BaseBlock }
  | { op: 'update'; id: string; formData: Partial<BaseBlock['formData']> }
  | { op: 'delete'; id: string }
  | { op: 'move'; id: string; fromIndex: number; toIndex: number }