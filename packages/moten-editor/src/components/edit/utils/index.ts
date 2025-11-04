import type { BaseBlock } from '@/types/edit'
import { generateUniqueId } from '@/utils'

export const createNewBlock = (element: BaseBlock) => {
  const cloned = JSON.parse(JSON.stringify(element))
  cloned.id = generateUniqueId()
  cloned.width = cloned.width ? cloned.width : 200
  cloned.height = cloned.height ? cloned.height : 200
  return cloned
}
