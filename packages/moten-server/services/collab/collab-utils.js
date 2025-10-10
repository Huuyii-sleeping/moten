/**
 * 生成唯一ID（基于时间戳+随机字符串，36进制）
 * @returns {string} 唯一ID（格式：时间戳-随机串）
 */
export function generateUniqueId() {
  const timestamp = Date.now().toString(36); // 时间戳转36进制（缩短长度）
  const randomStr = Math.random().toString(36).slice(2, 10); // 8位随机字符串
  return `${timestamp}-${randomStr}`;
}

/**
 * 校验 WebSocket 连接状态（是否处于可发送消息的 OPEN 状态）
 * @param {import('ws').WebSocket} ws - WebSocket 实例
 * @returns {boolean} 可发送返回 true，否则 false
 */
export function isWsAvailable(ws) {
  return ws && ws.readyState === 1; // 1 = WebSocket.OPEN 状态
}

/**
 * 解析 WebSocket 连接参数（从 URL 中提取 docId 和 isEditor）
 * @param {string} url - WebSocket 连接 URL（如 /ws?docId=doc123&isEditor=true）
 * @returns {{docId: string|null, isEditor: boolean}} 解析结果
 */
export function parseWsParams(url) {
  if (!url || !url.includes("?")) {
    return { docId: null, isEditor: false };
  }
  const params = new URLSearchParams(url.split("?")[1]);
  return {
    docId: params.get("docId"),
    isEditor: params.get("isEditor") === "true", // 转为布尔值（默认 false）
  };
}
