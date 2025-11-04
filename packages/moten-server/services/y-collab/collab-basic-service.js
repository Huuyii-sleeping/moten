import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness";
import { encodeStateAsUpdate, applyUpdate } from "y-protocols/state";
import { CollabStorage } from "../collab/collab-storage";
import { CollabBroadcaster } from "../collab/collab-boardcaster";
import { WebSocketServer, WebSocket } from "ws";
import { parseWsParams } from "../collab/collab-utils";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger"; 

interface CollabWebSocket extends WebSocket {
  userId: string; 
  docId: string;  
  username: string; 
  isEditor: boolean; 
}

type CustomMessage = 
  | { type: 'canvas_operation'; payload: any }
  | { type: 'comment_added'; payload: any }
  | { type: 'comment_resolved'; payload: { id: string } }
  | { type: 'user_joined'; payload: { userId: string; username: string } }
  | { type: 'user_left'; payload: { userId: string; userCount: number } }
  | { type: 'room_dismissed'; payload: { reason: string } };

export class BasicCollabService {
  private yDocs: Map<string, Y.Doc>;
  private awareness: Map<string, Awareness>; 
  private storage: CollabStorage; // 持久化存储
  private wss: WebSocketServer | null = null;
  private docConnections: Map<string, Set<CollabWebSocket>>; 

  constructor() {
    this.yDocs = new Map();
    this.awareness = new Map();
    this.storage = new CollabStorage();
    this.docConnections = new Map();
  }

  /**
   * 初始化WebSocket服务器，绑定与前端的协同逻辑
   * @param server HTTP服务器（用于升级WebSocket连接）
   */
  init(server: any) {
    this.wss = new WebSocketServer({ server });
    logger.info("协同服务启动，等待前端连接...");

    this.wss.on("connection", async (ws: CollabWebSocket, req) => {
      try {
        const params = parseWsParams(req.url);
        const { docId, isEditor = false, username = "匿名用户" } = params;

        if (!docId) {
          ws.close(400, "缺少docId参数");
          return;
        }

        const userId = uuidv4();
        ws.userId = userId;
        ws.docId = docId;
        ws.username = username;
        ws.isEditor = isEditor;

        if (!this.docConnections.has(docId)) {
          this.docConnections.set(docId, new Set());
        }
        this.docConnections.get(docId)!.add(ws);

        const { ydoc, awareness } = await this.getOrCreateDoc(docId);

        awareness.setLocalStateField(userId, {
          userId,
          username,
          isEditor,
          color: this.generateUserColor(userId),
          online: true,
          lastActive: Date.now()
        });

        const provider = new WebsocketProvider(
          "", 
          docId,
          ydoc,
          { websocket: ws as any, connect: false } 
        );

        this.sendFullStateToClient(ws, docId, ydoc, awareness);

        const handleDocUpdate = (update: Uint8Array, origin: any) => {
          if (origin !== "storage") {
            this.storage.saveDocUpdate(docId, update, ydoc.version);
            logger.debug(`文档${docId}更新，版本: ${ydoc.version}`);
          }
        };
        ydoc.on("update", handleDocUpdate);

        awareness.on("update", () => {
          this.broadcastAwarenessUpdate(docId, awareness);
        });

        ws.on("message", (data) => {
          this.handleClientCustomMessage(ws, data.toString());
        });

        this.broadcastToDocClients(docId, {
          type: "user_joined",
          payload: {
            userId,
            username,
            userCount: this.getDocUserCount(docId)
          }
        }, userId);

        ws.on("close", () => {
          logger.info(`用户${userId}离开文档${docId}`);
          
          awareness.setLocalStateField(userId, { ...awareness.getLocalState(userId)!, online: false });
          this.docConnections.get(docId)!.delete(ws);
          provider.destroy();
          ydoc.off("update", handleDocUpdate);

          this.broadcastToDocClients(docId, {
            type: "user_left",
            payload: {
              userId,
              userCount: this.getDocUserCount(docId)
            }
          });

          if (this.getDocUserCount(docId) === 0) {
            this.cleanupDoc(docId, ydoc);
          }
        });

        ws.on("error", (err) => {
          logger.error(`用户${userId}连接错误:`, err);
        });

      } catch (err) {
        logger.error("处理连接失败:", err);
        ws.close(500, "服务器处理连接失败");
      }
    });
  }

  /**
   * 获取或创建文档（从存储加载历史状态）
   * @param docId 文档ID
   */
  private async getOrCreateDoc(docId: string): Promise<{ ydoc: Y.Doc; awareness: Awareness }> {
    if (this.yDocs.has(docId)) {
      return {
        ydoc: this.yDocs.get(docId)!,
        awareness: this.awareness.get(docId)!
      };
    }

    // 创建新文档
    const ydoc = new Y.Doc();
    const awareness = new Awareness(ydoc);

    // 从存储加载历史状态（如果存在）
    const savedState = await this.storage.loadDocState(docId);
    if (savedState?.update) {
      applyUpdate(ydoc, savedState.update); // 应用历史更新
      logger.info(`文档${docId}从存储加载，版本: ${savedState.version}`);
    } else {
      logger.info(`创建新文档${docId}`);
    }

    // 存储文档实例
    this.yDocs.set(docId, ydoc);
    this.awareness.set(docId, awareness);

    return { ydoc, awareness };
  }

  /**
   * 向新连接的客户端发送文档完整状态
   * （对应前端full_state_response处理逻辑）
   */
  private sendFullStateToClient(ws: CollabWebSocket, docId: string, ydoc: Y.Doc, awareness: Awareness) {
    try {
      // 生成Y.js文档完整更新包
      const fullUpdate = encodeStateAsUpdate(ydoc);
      // 读取存储的评论和历史记录
      const comments = await this.storage.getComments(docId);
      const history = await this.storage.getHistory(docId);

      ws.send(JSON.stringify({
        type: "full_state_response",
        payload: {
          docId,
          // Y.js二进制更新转base64传输
          update: Buffer.from(fullUpdate).toString("base64"),
          version: ydoc.version,
          // 块配置（前端需要的结构化数据）
          blockConfig: Array.from(ydoc.getArray("blockConfig")),
          pageConfig: Object.fromEntries(ydoc.getMap("pageConfig").entries()),
          canvasState: Object.fromEntries(ydoc.getMap("canvasState").entries()),
          // 附加数据
          comments,
          history,
          userCount: this.getDocUserCount(docId)
        }
      }));
    } catch (err) {
      logger.error(`向用户${ws.userId}发送初始状态失败:`, err);
      ws.close(500, "发送文档初始状态失败");
    }
  }

  /**
   * 广播感知状态更新（用户在线状态、光标等）
   * （对应前端awareness监听逻辑）
   */
  private broadcastAwarenessUpdate(docId: string, awareness: Awareness) {
    const update = awareness.getUpdate(); // 获取感知状态更新包
    const connections = this.docConnections.get(docId);

    if (!connections) return;

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "awareness_update",
          payload: {
            docId,
            update: Buffer.from(update).toString("base64") // 二进制转base64
          }
        }));
      }
    });
  }

  /**
   * 处理前端发送的自定义消息（非Y.js核心数据）
   * 如：画布操作、评论、历史记录等
   */
  private handleClientCustomMessage(ws: CollabWebSocket, data: string) {
    try {
      const message: CustomMessage = JSON.parse(data);
      const { docId, userId } = ws;

      switch (message.type) {
        // 画布操作：广播给其他用户（对应前端handleCanvasOperation）
        case "canvas_operation":
          this.broadcastToDocClients(docId, {
            type: "canvas_operation",
            payload: { ...message.payload, userId } // 附加发送者ID
          }, userId); // 排除发送者
          // 持久化画布状态（可选，根据需求）
          if (message.payload.type === "init_canvas" && message.payload.payload.canvasDataUrl) {
            const ydoc = this.yDocs.get(docId);
            ydoc?.getMap("canvasState").set("canvasDataUrl", message.payload.payload.canvasDataUrl);
          }
          break;

        // 新增评论：保存并广播（对应前端comment_added）
        case "comment_added":
          const comment = { ...message.payload, id: uuidv4(), userId: ws.userId, username: ws.username };
          this.storage.saveComment(docId, comment); // 持久化
          this.broadcastToDocClients(docId, {
            type: "comment_added",
            payload: comment
          }); // 广播给所有人
          break;

        // 解决评论：更新状态并广播（对应前端comment_resolved）
        case "comment_resolved":
          this.storage.resolveComment(docId, message.payload.id); // 持久化
          this.broadcastToDocClients(docId, {
            type: "comment_resolved",
            payload: message.payload
          }); // 广播给所有人
          break;

        // 解散房间（仅编辑者可操作，对应前端room_dismissed）
        case "room_dismissed":
          if (ws.isEditor) { // 验证编辑者权限
            this.broadcastToDocClients(docId, message); // 广播解散通知
            // 关闭所有连接
            this.docConnections.get(docId)?.forEach(ws => ws.close(1000, "房间已解散"));
            this.cleanupDoc(docId); // 清理文档
          }
          break;
      }
    } catch (err) {
      logger.error("处理自定义消息失败:", err);
    }
  }

  /**
   * 向文档内指定用户外的所有客户端广播消息
   * @param docId 文档ID
   * @param message 消息内容
   * @param excludeUserId 排除的用户ID（通常是发送者）
   */
  private broadcastToDocClients(docId: string, message: CustomMessage, excludeUserId?: string) {
    const connections = this.docConnections.get(docId);
    if (!connections) return;

    connections.forEach(ws => {
      if (
        ws.readyState === WebSocket.OPEN && 
        (!excludeUserId || ws.userId !== excludeUserId)
      ) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * 获取文档当前在线用户数
   */
  private getDocUserCount(docId: string): number {
    return this.docConnections.get(docId)?.size || 0;
  }

  /**
   * 生成用户颜色（与前端generateUserColor逻辑一致）
   */
  private generateUserColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
  }

  /**
   * 清理文档资源（内存+存储）
   */
  private async cleanupDoc(docId: string, ydoc?: Y.Doc) {
    // 保存最终状态到存储
    const targetDoc = ydoc || this.yDocs.get(docId);
    if (targetDoc) {
      const finalUpdate = encodeStateAsUpdate(targetDoc);
      await this.storage.saveDocUpdate(docId, finalUpdate, targetDoc.version);
      logger.info(`文档${docId}已保存，当前版本: ${targetDoc.version}`);
    }

    // 清理内存
    this.yDocs.delete(docId);
    this.awareness.delete(docId);
    this.docConnections.delete(docId);
    logger.info(`文档${docId}资源已清理`);
  }
}