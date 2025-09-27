import { customAlphabet } from 'nanoid'
import { defineAsyncComponent, markRaw, type Component } from 'vue'

/**
 * 随机id生成
 * @param length 长度
 * @returns
 */
export const nanoid = (length = 8) => {
  // 创建自定义字符级和长度的唯一id生成器 控制生成的id的所用的字符和长度
  const generateId = customAlphabet('123456789qwertyuiopasdfghjklzxcvbnm', length)
  return generateId()
}

/**
 * 延迟函数
 * @param delay
 * @returns
 */
export const sleep = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * 动态引入组件 模块映射中动态加载指定名称的vue组件
 * @param name 组件名
 * @param importUrl 引入所有的组件 import.meta.glob('@/components/config/*')
 * @returns
 */
export const batchDynamicComponents = (name: string, importUrl: Record<string, Component>) => {
  const components = importUrl
  const componentMap = Object.assign(
    // 构建组件名称的映射
    {},
    ...Object.keys(components).map((item) => {
      const name = item?.split('/')?.pop()?.replace('.vue', '') || ''
      return {
        [name]: components[item],
      }
    }),
  )
  // 根据name查找组件使用
  const importComponent = componentMap[name]
  if (!importComponent) return ''
  // markRaw非响应式包装 组件本身不需要响应式包装
  return markRaw(defineAsyncComponent(importComponent))
}
