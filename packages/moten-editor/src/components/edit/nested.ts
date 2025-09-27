import { cloneDeep } from 'lodash-es'
import { nanoid } from '@/utils/index'
import type { BaseBlock, Viewport } from '@/types/edit'
/**
 *  column嵌套class
 *  用来move里面判断是否可以嵌套
 */
export const nestedClass = 'nested-container'

/**
 *  多个draggale组件的group名
 *  相同的名字可以相互拖拽
 */
export const dragGroup = 'blocks'

/**
 * draggable移动事件
 * 判断是否可以拖入
 * @returns
 */
export const move = (e: any) => {
  const classList = Array.from(e?.to?.classList)
  const isRelatedNested = classList?.includes(nestedClass)
  if (e?.draggedContext?.element?.nested && isRelatedNested) return false
  return true
}

export const clone = (e: Object) => {
  return cloneDeep({ ...e, id: nanoid(8) })
}

/**
 * 找到相应的id里面的formData做更新
 * @param arr
 * @param nodeId
 * @param viewport
 * @param data
 */
export const findNodeById = (arr: BaseBlock[], nodeId: string, data: any) => {
  const array = cloneDeep(arr)
  for (let i = 0; i < array.length; i++) {
    const element = array[i] as any
    if (element.id === nodeId) {
      data({
        // 找到对应的进行回调更新操作
        array,
        node: element,
        index: i,
      })
      return array
    }
  }
  return array
}
