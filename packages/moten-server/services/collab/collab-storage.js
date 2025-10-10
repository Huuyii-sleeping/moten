export class CollabStorage {
  constructor() {
    // 文档核心数据：docId -> DocumentState
    this.docData = new Map();
    // WebSocket连接：docId -> Set<WebSocket>
    this.connections = new Map();
    // 用户计数：docId -> number
    this.userCount = new Map();
    // 用户选中状态：docId -> Map<WebSocket, UserSelection>
    this.userSelections = new Map();
    // 用户权限：docId -> Map<WebSocket, boolean>（true=编辑者，false=只读）
    this.userRole = new Map();
    // 操作历史：docId -> HistoryRecord[]
    this.historyRecords = new Map();
    // 评论数据：docId -> Comment[]
    this.comments = new Map();
  }

  /**
   * 初始化文档存储结构（若不存在则创建）
   * @param {string} docId - 文档ID
   */
  initDocument(docId) {
    if (!this.connections.has(docId)) this.connections.set(docId, new Set());
    if (!this.docData.has(docId)) {
      this.docData.set(docId, {
        blockConfig: [],
        pageConfig: {},
        version: 0,
      });
    }
    if (!this.userRole.has(docId)) this.userRole.set(docId, new Map());
    if (!this.userSelections.has(docId))
      this.userSelections.set(docId, new Map());
    if (!this.historyRecords.has(docId)) this.historyRecords.set(docId, []);
    if (!this.comments.has(docId)) this.comments.set(docId, []);
    if (!this.userCount.has(docId)) this.userCount.set(docId, 0);
  }

  /**
   * 获取文档当前状态
   * @param {string} docId - 文档ID
   * @returns {DocumentState|null}
   */
  getDocState(docId) {
    return this.docData.get(docId) || null;
  }

  /**
   * 更新文档状态
   * @param {string} docId - 文档ID
   * @param {DocumentState} newState - 新文档状态
   */
  updateDocState(docId, newState) {
    this.docData.set(docId, newState);
  }

  /**
   * 添加WebSocket连接
   * @param {string} docId - 文档ID
   * @param {WebSocket} ws - WebSocket实例
   */
  addConnection(docId, ws) {
    this.connections.get(docId)?.add(ws);
  }

  /**
   * 移除WebSocket连接
   * @param {string} docId - 文档ID
   * @param {WebSocket} ws - WebSocket实例
   */
  removeConnection(docId, ws) {
    this.connections.get(docId)?.delete(ws);
  }

  /**
   * 获取文档的所有连接
   * @param {string} docId - 文档ID
   * @returns {Set<WebSocket>|null}
   */
  getConnections(docId) {
    return this.connections.get(docId) || null;
  }

  /**
   * 清理文档所有存储（当最后一个用户断开时）
   * @param {string} docId - 文档ID
   */
  clearDocStorage(docId) {
    this.docData.delete(docId);
    this.connections.delete(docId);
    this.userCount.delete(docId);
    this.userSelections.delete(docId);
    this.userRole.delete(docId);
    this.historyRecords.delete(docId);
    this.comments.delete(docId);
  }

  setUserRole(docId, ws, isEditor) {
    this.userRole.get(docId).set(ws, isEditor);
  }
  getUserRole(docId, ws) {
    return this.userRole.get(docId).get(ws);
  }
  updateUserCount(docId, count) {
    this.userCount.set(docId, Math.max(0, count));
  }
  getUserCount(docId) {
    return this.userCount.get(docId) || 0;
  }
  setUserSelection(docId, ws, selection) {
    this.userSelections.get(docId).set(ws, selection);
  }
  getUserSelection(docId) {
    return this.userSelections.get(docId) || null;
  }
  addHistoryRecord(docId, record) {
    this.historyRecords.get(docId).push(record);
  }
  getHistoryRecords(docId) {
    return this.historyRecords.get(docId) || [];
  }
  addComment(docId, comment) {
    this.comments.get(docId).push(comment);
  }
  updateCommentStatus(docId, commentId, resolved) {
    const comments = this.comments.get(docId);
    const comment = comments.find((c) => c.id === commentId);
    comment.resolved = resolved;
  }
  getComments(docId) {
    return this.comments.get(docId);
  }

  clearDocStorage(docId) {
    this.docData.delete(docId);
    this.connections.delete(docId);
    this.userCount.delete(docId);
    this.userSelections.delete(docId);
    this.userRole.delete(docId);
    this.historyRecords.delete(docId);
    this.comments.delete(docId);
    console.log(`[Storage] Cleared all data for doc: ${docId}`);
  }
}
