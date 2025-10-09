// services/baseCollabServices.js
import { WebSocketServer } from "ws";

export class BasicCollabService {
  constructor() {
    this.connections = new Map(); // docId -> Set<WebSocket>
    this.docData = new Map(); // docId -> 最新文档数据
    this.userCount = new Map();
  }

  init(server) {
    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
      const params = new URLSearchParams(req.url.split("?")[1]);
      const docId = params.get("docId");

      if (!docId) {
        ws.close(400, "Missing docId parameter");
        return;
      }

      this._initDocument(docId);
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

        default:
          console.warn("Unknown message type:", parsedMessage.type);
      }
    } catch (error) {
      console.warn("Error handling client message", error);
    }
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
}
