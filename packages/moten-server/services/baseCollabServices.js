import { WebSocketServer } from "ws";
import pkg from "fast-json-patch";
const { applyPatch } = pkg;

export class BasicCollabService {
  constructor() {
    this.connections = new Map(); // docId -> Set<WebSocket>
    this.docData = new Map(); // docId -> 最新文档数据
    this.userCount = new Map();
    this.userSelections = new Map();
    this.userRole = new Map();
    this.historyRecords = new Map(); // docId -> Array<History>
    this.comments = new Map();
  }

  init(server) {
    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
      const params = new URLSearchParams(req.url.split("?")[1]);
      const docId = params.get("docId");
      const isEditor = params.get("isEditor") === "true";
      ws.id = Date.now().toString() + Math.random().toString(36).slice(2);

      if (!docId) {
        ws.close(400, "Missing docId parameter");
        return;
      }

      if (!this.userRole.has(docId)) {
        this.userRole.set(docId, new Map());
      }
      this.userRole.get(docId).set(ws, isEditor);
      this._initDocument(docId);
      this.userSelections.set(docId, new Map());
      this.connections.get(docId).add(ws);
      console.log(`User connected to document: ${docId}`);

      // 发送初始数据给新连接的客户端
      this._sendInitialData(ws, docId);
      this.userCount.set(docId, (this.userCount.get(docId) || 0) + 1);
      this._broadcastUserUpdate(docId, "user_joined");

      ws.on("message", (data) => {
        this._handleClientMessage(docId, ws, data.toString());
      });

      ws.on("close", () => {
        this.connections.get(docId).delete(ws);
        console.log(`User disconnected from document: ${docId}`);
        const currentCount = this.userCount.get(docId) || 1;
        const newCount = Math.max(0, currentCount - 1);
        this.userCount.set(docId, newCount);

        this._broadcastUserUpdate(docId, "user_left");
        if (this.connections.get(docId).size === 0) {
          // 可以选择保留文档数据一段时间，或者立即清理
          this.connections.delete(docId);
          this.docData.delete(docId);
          this.userCount.delete(docId);
          console.log(`All users left document ${docId}`);
        }
      });
    });
    console.log("Collaboration service initialized with WebSocket");
  }

  /**
   * 初始化文档的数据结构 - 匹配前端 Pinia store 结构
   * @param {string} docId 文档ID
   */
  _initDocument(docId) {
    if (!this.connections.has(docId)) {
      this.connections.set(docId, new Set());
    }
    if (!this.docData.has(docId)) {
      this.docData.set(docId, {
        // 匹配 useEditStore 的状态结构
        blockConfig: [],
        pageConfig: {},
        version: 0,
        // 可以添加其他需要协同的状态
      });
    }
  }

  /**
   * 发送初始数据给新连接的客户端
   * @param {WebSocket} ws websocket实例对象
   * @param {string} docId 文档ID
   */
  _sendInitialData(ws, docId) {
    const data = this.docData.get(docId);
    ws.send(
      JSON.stringify({
        type: "initial_data",
        payload: data,
      })
    );
  }

  /**
   * 处理客户端发送的消息
   * @param {string} docId 文档ID
   * @param {WebSocket} ws 发送消息的客户端
   * @param {string} message 消息内容
   */
  _handleClientMessage(docId, ws, message) {
    try {
      const parsedMessage = JSON.parse(message);
      const isEditor = this.userRole.get(docId)?.get(ws) || false;
      if (!isEditor && parsedMessage.type.startsWith("update_")) {
        console.warn("只读用户尝试编辑，已拒绝");
        return;
      }

      switch (parsedMessage.type) {
        case "update_block_config":
          this._handleBlockConfigUpdate(docId, parsedMessage.payload, ws);
          break;

        case "update_page_config":
          this._handlePageConfigUpdate(docId, parsedMessage.payload, ws);
          break;

        case "update_full_state":
          this._handleFullStateUpdate(docId, parsedMessage.payload);
          break;
        case "user_selection":
          this._handleUserSelection(docId, ws, parsedMessage.payload);
          break;
        case "block_operation":
          this._handleBlockOperation(docId, parsedMessage.payload, ws);
          break;
        case "update_block_delta":
          this._handleBlockDeltaUpdate(
            docId,
            parsedMessage.payload,
            parsedMessage.version,
            ws
          );
          break;
        case "add_comment":
          this._handleAddComment(docId, parsedMessage.payload, ws);
          break;
        case "resolve_comment":
          this._handleResolveComment(docId, parsedMessage.payload.id);
          break;
        case "get_comments":
          this._sendComments(docId, ws);
          break;
        case "get_history":
          this._sendHistory(docId, ws);
          break;
        default:
          console.warn("Unknown message type:", parsedMessage.type);
          break;
      }
    } catch (error) {
      console.warn("Error handling client message", error);
    }
  }

  _sendHistory(docId, ws) {
    const records = this.historyRecords.get(docId) || [];
    ws.send(
      JSON.stringify({
        type: "history_records",
        payload: records,
      })
    );
  }

  _handleAddComment(docId, commentData, ws) {
    const comment = {
      id: this._generateId(),
      ...commentData,
      authorId: ws.id,
      createdAt: Date.now(),
      resolved: false,
    };

    if (!this.comments.has(docId)) {
      this.comments.set(docId, []);
    }
    this.comments.get(docId).push(comment);
    this._broadcastUpdate(docId, {
      type: "comment_added",
      payload: comment,
    });
  }

  _handleResolveComment(docId, commentDataId) {
    const comments = this.comments.get(docId);
    const comment = comments.find((c) => c.id === commentDataId);
    if (comment) {
      comment.resolved = true;
      this._broadcastUpdate(docId, {
        type: "comment_resolved",
        payload: { id: commentDataId },
      });
    }
  }

  _sendComments(docId, ws) {
    const comments = this.comments.get(docId) || [];
    ws.send(
      JSON.stringify({
        type: "comment-list",
        payload: comments,
      })
    );
  }

  _handleBlockOperation(docId, operation, senderWs) {
    const doc = this.docData.get(docId);
    const blockConfig = doc.blockConfig;

    switch (operation.op) {
      case "add":
        blockConfig.push(operation.block);
        break;
      case "update":
        const index = blockConfig.findIndex((b) => b.id === operation.id);
        if (index !== -1) {
          blockConfig[index].formData = {
            ...blockConfig[index].formData,
            ...operation.forData,
          };
        }
        break;
      case "delete":
        const deleteIndex = blockConfig.findIndex((b) => b.id === operation.id);
        if (deleteIndex !== -1) {
          blockConfig.splice(deleteIndex, 1);
        }
        break;
      case "move":
        if (
          operation.fromIndex >= 0 &&
          operation.toIndex >= 0 &&
          operation.fromIndex < blockConfig.length
        ) {
          const [moveBlock] = blockConfig.splice(operation.fromIndex, 1);
          blockConfig.splice(operation.toIndex, 0, moveBlock);
        }
        break;
    }
    this._broadcastUpdate(
      docId,
      { type: "block_operation", payload: operation },
      senderWs
    );
  }

  /**
   * 实现后端应用增量
   * @param {string} docId
   * @param {Object} patches
   * @param {string} senderWs
   */
  _handleBlockDeltaUpdate(docId, patches, clientVersion, senderWs) {
    const currentData = this.docData.get(docId);
    if (clientVersion < currentData.version) {
      senderWs.send(
        JSON.stringify({
          type: "conflict_detected",
          expectedVersion: currentData.version,
          currentBlocks: currentData.blockConfig, // 可选：发送最新数据
        })
      );
      return;
    }
    const updateData = {
      ...applyPatch(currentData, patches, true).newDocument,
      version: currentData.version + 1,
    };
    this.docData.set(docId, updateData);
    this._broadcastUpdate(
      docId,
      {
        type: "block_delta_applied",
        payload: patches,
        version: updateData.version,
      },
      senderWs
    );
  }

  /**
   * 将选中的区域广播出去 排除自己
   * @param {string} docId
   * @param {Object} ws
   * @param {Object} selection
   */
  _handleUserSelection(docId, ws, selection) {
    const selections = this.userSelections.get(docId);
    selections.set(ws, selection);
    this._broadcastUpdate(docId, {
      type: "remote_selection",
      payload: { wsId: ws.id, ...selection },
      ws,
    });
  }

  /**
   * 处理 blockConfig 更新
   * @param {string} docId 文档ID
   * @param {Array} payload 更新的 blockConfig 数据
   */
  _handleBlockConfigUpdate(docId, payload, senderWs) {
    const currentData = this.docData.get(docId);
    const updatedData = {
      ...currentData,
      blockConfig: payload,
      version: currentData.version + 1,
    };
    this.docData.set(docId, updatedData);
    const historyRecord = {
      id: this._generateId(),
      timestamp: Date.now(),
      userId: "user-" + Date.now(),
      operation: "block_config_update",
      blockConfig: payload || updatedData,
      version: updatedData.version,
    };
    if (!this.historyRecords.has(docId)) {
      this.historyRecords.set(docId, []);
    }
    this.historyRecords.get(docId).push(historyRecord);
    this._broadcastUpdate(
      docId,
      {
        type: "block_config_updated",
        payload: updatedData,
      },
      senderWs
    );
  }

  /**
   * 处理 pageConfig 更新
   * @param {string} docId 文档ID
   * @param {Object} payload 更新的 pageConfig 数据
   */
  _handlePageConfigUpdate(docId, payload, senderWs) {
    const currentData = this.docData.get(docId);
    const updatedData = {
      ...currentData,
      pageConfig: payload,
      version: currentData.version + 1,
    };
    this.docData.set(docId, updatedData);
    const historyRecord = {
      id: this._generateId(),
      timestamp: Date.now(),
      userId: "user-" + Date.now(),
      operation: "page_config_update",
      pageConfig: payload || updatedData,
      version: updatedData.version,
    };
    if (!this.historyRecords.has(docId)) {
      this.historyRecords.set(docId, []);
    }
    this.historyRecords.get(docId).push(historyRecord);
    this._broadcastUpdate(
      docId,
      {
        type: "page_config_updated",
        payload: updatedData,
      },
      senderWs
    );
  }

  /**
   * 处理完整状态更新（用于批量更新）
   * @param {string} docId 文档ID
   * @param {Object} payload 完整的状态数据
   */
  _handleFullStateUpdate(docId, payload) {
    const currentData = this.docData.get(docId);
    const updatedData = {
      ...currentData,
      ...payload,
      version: currentData.version + 1,
    };
    this.docData.set(docId, updatedData);
    const historyRecord = {
      id: this._generateId(),
      timestamp: Date.now(),
      userId: "user-" + Date.now(),
      operation: "full_state_update",
      blockConfig: payload.blockConfig || updatedData.blockConfig,
      pageConfig: payload.pageConfig || updatedData.pageConfig,
      version: updatedData.version,
    };
    if (!this.historyRecords.has(docId)) {
      this.historyRecords.set(docId, []);
    }
    this.historyRecords.get(docId).push(historyRecord);
    this._broadcastUpdate(docId, {
      type: "full_state_updated",
      payload: updatedData,
    });
  }

  /**
   * 将更新的数据广播出去
   * @param {string} docId 文档ID
   * @param {Object} message 广播的消息对象
   */
  _broadcastUpdate(docId, message, excludeWs = null) {
    const messageStr = JSON.stringify(message);
    const connections = this.connections.get(docId);
    if (!connections) return;

    connections.forEach((ws) => {
      if (ws === excludeWs) return;
      if (ws.readyState === 1) {
        ws.send(messageStr);
      }
    });
  }

  _broadcastUserUpdate(docId, type) {
    const userCount = this.userCount.get(docId) || 1;
    const message = JSON.stringify({
      type: type,
      payload: {
        userCount: userCount,
      },
    });
    const connections = this.connections.get(docId);
    if (!connections) return;

    connections.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(message);
      }
    });
  }
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
