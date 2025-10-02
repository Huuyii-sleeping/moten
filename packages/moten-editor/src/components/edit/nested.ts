import type { BaseBlock } from '@/types/edit'
import { nanoid } from '@/utils/index'
import { cloneDeep, isEqual } from 'lodash-es'
import { toRaw } from 'vue'

/**
 * column嵌套class
 * 用来在move里判断是否可以嵌套
 */
export const nestedClass = 'nested-container'

/**
 * 多个draggable组件的group名
 * 相同名可以相互拖拽
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

/**
 * draggable克隆事件
 * @param e
 * @returns
 */
export const clone = (e: object) => {
  return cloneDeep({ ...e, id: nanoid(8) })
}

/**
 * 替换 node id
 * @param node
 * @returns
 */
export const replaceNodeId = (node: any) => {
  if (!node) return node
  const newNode = cloneDeep(node)
  const { children } = newNode || {}
  if (children?.length) {
    for (let i = 0; i < children.length; i++) {
      for (let j = 0; j < children[i].length; j++) {
        children[i][j] = replaceNodeId(children[i][j])
      }
    }
  }
  return clone(newNode)
}

export interface FindNodeByIdCallBack {
  array: BaseBlock[]
  node: BaseBlock[][number]
  index: number
}

/**
 * 找到相应id里的FormData做更新
 * @param arr
 * @param nodeId
 * @param callback
 * @returns
 */
export const findNodeById = (
  arr: BaseBlock[],
  nodeId: string,
  callback: (params: FindNodeByIdCallBack) => void,
) => {
  const array = cloneDeep(arr)

  for (let i = 0; i < array.length; i++) {
    const element = array[i] as any
    if (element.id === nodeId) {
      // 如果找到了匹配的节点，直接回调返回
      callback({
        array,
        node: element,
        index: i,
      })
      return array
    }

    if (element.children?.length) {
      // 如果节点有子节点，则递归调用 findNodeById 函数
      for (let j = 0; j < element.children.length; j++) {
        const elementChildren = element.children[j]
        if (!elementChildren.length) continue
        // 递归找到对应的数据
        const newChildren = findNodeById(elementChildren, nodeId, callback)
        if (!isEqual(newChildren, elementChildren)) {
          // 如果子节点数组有更新，则更新当前节点的子节点数组
          if (newChildren) element.children[j] = newChildren
          return array
        }
      }
    }
  }

  return array
}

export const reverseBlockConfig = (config: any) => {
  return config.map((item: any) => ({
    id: item.id,
    code: item.code,
    formData: toRaw(item.value),
    children: item.children,
    nested: item.nested,
  }))
}

export const getPageList = (route: any, list: any, allPages: any) => {
  if (route.params) {
    const { id } = route.params
    if (id) {
      let selectPage: any
      allPages.forEach((page: any) => {
        if (page.page_id === Number(id)) {
          selectPage = page
        }
      })
      if (selectPage) {
        const _page = reverseBlockConfig(selectPage.content)
        list.value = _page
      }
    }
  }
}
