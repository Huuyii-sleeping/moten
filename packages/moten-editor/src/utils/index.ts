import { customAlphabet } from 'nanoid'

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
