import type { BaseBlock } from '@/types/edit'

export type BlockOperation =
  | { op: 'add'; block: BaseBlock }
  | { op: 'update'; id: string; formData: Partial<BaseBlock['formData']> }
  | { op: 'delete'; id: string }
  | { op: 'move'; id: string; fromIndex: number; toIndex: number }

export type CanvasOperation = {
  type: 'draw' | 'clear' | 'undo' | 'redo' | 'shape' | 'init_canvas' | 'tool_switch'
  payload: {
    x?: number
    y?: number
    lastX?: number
    lastY?: number
    shapeType?: 'rect' | 'circle' | 'line'
    startX?: number
    startY?: number
    endX?: number
    endY?: number
    color?: string
    size?: number
    canvasDataUrl?: string
    tool?: string
  }
  userId: string
  timestamp: number
}
