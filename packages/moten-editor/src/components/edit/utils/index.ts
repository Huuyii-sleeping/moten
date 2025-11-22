import type { BaseBlock } from '@/types/edit'
import { generateUniqueId } from '@/utils'

export const createNewBlock = (element: BaseBlock) => {
  const cloned = JSON.parse(JSON.stringify(element))
  cloned.id = generateUniqueId()
  cloned.width = cloned.width ? cloned.width : 200
  cloned.height = cloned.height ? cloned.height : 200
  return cloned
}

export const isRectIntersect = (
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number },
) => {
  return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y)
}


