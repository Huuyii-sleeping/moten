import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { WebSocketServer, WebSocket } from "ws";
import { CollabStorage } from "../collab/collab-storage.js";
import { generateUniqueId, parseWsParams } from "../collab/collab-utils.js";
import { pageDAO } from "../../dao/page.js";

function createNoopLogger() {
  return {
    info() {},
    warn() {},
    error() {},
    debug() {},
  };
}

export class BasicCollabService {
  constructor({ storage, logger, pageRepository } = {}) {
    this.storage = storage ?? new CollabStorage();
    this.logger = logger ?? createNoopLogger();
    this.pageRepository = pageRepository ?? pageDAO;
    this.wss = null;
    this.yDocs = new Map();
    this.awarenessByDoc = new Map();
    this.connectionsByDoc = new Map();
    this.docCleanupFns = new Map();
  }

  init(server) {
    this.wss = new WebSocketServer({ server });
    this.logger.info("Yjs 协同服务已启动");

    this.wss.on("connection", async (ws, req) => {
      try {
        await this.handleConnection(ws, req);
      } catch (error) {
        this.logger.error("处理 Yjs 连接失败", error);
        ws.close(1011, "处理协同连接失败");
      }
    });
  }

  async handleConnection(ws, req) {
    const { docId, isEditor = false, username = "匿名用户", seedFrom } = parseWsParams(
      req?.url || "",
    );

    if (!docId) {
      ws.close(4000, "缺少 docId 参数");
      return;
    }

    ws.id = generateUniqueId();
    ws.docId = docId;
    ws.username = username;
    ws.isEditor = isEditor;

    const { ydoc } = await this.getOrCreateDoc(docId, {
      seedFromDocId: seedFrom,
    });
    const connections = this._getDocConnections(docId);
    connections.add(ws);

    this._setPresence(docId, ws);
    await this.sendFullStateToClient(ws, docId, ydoc);
    this.broadcastOnlineState(docId);

    ws.on("message", (raw) => {
      this.handleClientCustomMessage(ws, raw.toString());
    });

    ws.on("close", async () => {
      await this.handleDisconnect(ws);
    });

    ws.on("error", (error) => {
      this.logger.error(`Yjs 客户端 ${ws.id} 连接错误`, error);
    });
  }

  async getOrCreateDoc(docId, options = {}) {
    if (this.yDocs.has(docId)) {
      return {
        ydoc: this.yDocs.get(docId),
        awareness: this.awarenessByDoc.get(docId),
      };
    }

    const ydoc = new Y.Doc();
    const awareness = new Awareness(ydoc);
    const savedState = await this.storage.loadDocState(docId);

    if (savedState?.update) {
      Y.applyUpdate(ydoc, savedState.update, "storage");
      this.logger.info(`已从持久化恢复文档 ${docId}`);
    } else {
      await this._seedNewDoc(ydoc, docId, options);
      this.logger.info(`创建新的 Yjs 文档 ${docId}`);
    }

    this.yDocs.set(docId, ydoc);
    this.awarenessByDoc.set(docId, awareness);
    this._getDocConnections(docId);
    this._attachPersistence(docId, ydoc);

    return { ydoc, awareness };
  }

  async sendFullStateToClient(ws, docId, ydoc) {
    const comments = await this._loadComments(docId);
    const history = await this._loadHistory(docId);

    ws.send(
      JSON.stringify({
        type: "full_state_response",
        payload: {
          docId,
          update: Buffer.from(Y.encodeStateAsUpdate(ydoc)).toString("base64"),
          blockConfig: this._materializeArray(ydoc.getArray("blockConfig")),
          pageConfig: Object.fromEntries(ydoc.getMap("pageConfig").entries()),
          comments,
          history,
          userCount: this.getDocUserCount(docId),
        },
      }),
    );
  }

  broadcastOnlineState(docId) {
    const message = JSON.stringify({
      type: "presence_update",
      payload: {
        docId,
        userCount: this.getDocUserCount(docId),
        users: this._getPresenceList(docId),
      },
    });

    for (const ws of this._getDocConnections(docId)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  handleClientCustomMessage(ws, data) {
    let message;
    try {
      message = JSON.parse(data);
    } catch (error) {
      this.logger.warn(`忽略非法 JSON 消息: ${data}`);
      return;
    }

    const { docId } = ws;

    switch (message.type) {
      case "room_dismissed":
        this.broadcastToDocClients(docId, message);
        for (const client of this._getDocConnections(docId)) {
          client.close(1000, "房间已解散");
        }
        break;
      case "comment_added": {
        const comment = {
          ...message.payload,
          id: generateUniqueId(),
          userId: ws.id,
          username: ws.username,
        };
        this.storage.saveComment?.(docId, comment);
        this.broadcastToDocClients(docId, {
          type: "comment_added",
          payload: comment,
        });
        break;
      }
      case "comment_resolved":
        this.storage.resolveComment?.(docId, message.payload?.id);
        this.broadcastToDocClients(docId, {
          type: "comment_resolved",
          payload: message.payload,
        });
        break;
      default:
        this.logger.debug(`忽略第一轮未处理的协同消息类型: ${message.type}`);
    }
  }

  broadcastToDocClients(docId, message, excludeWsId) {
    const payload = JSON.stringify(message);
    for (const ws of this._getDocConnections(docId)) {
      if (ws.readyState !== WebSocket.OPEN) {
        continue;
      }
      if (excludeWsId && ws.id === excludeWsId) {
        continue;
      }
      ws.send(payload);
    }
  }

  getDocUserCount(docId) {
    return this._getDocConnections(docId).size;
  }

  async handleDisconnect(ws) {
    const { docId } = ws;
    const connections = this._getDocConnections(docId);
    connections.delete(ws);
    this._clearPresence(docId, ws.id);
    this.broadcastOnlineState(docId);

    if (connections.size === 0) {
      await this.cleanupDoc(docId);
    }
  }

  async cleanupDoc(docId) {
    const ydoc = this.yDocs.get(docId);
    const awareness = this.awarenessByDoc.get(docId);
    if (ydoc) {
      await this.storage.saveDocUpdate(
        docId,
        Y.encodeStateAsUpdate(ydoc),
        ydoc.store.clients.size,
      );
    }

    const cleanup = this.docCleanupFns.get(docId);
    cleanup?.();
    awareness?.destroy?.();
    ydoc?.destroy?.();
    this.docCleanupFns.delete(docId);
    this.yDocs.delete(docId);
    this.awarenessByDoc.delete(docId);
    this.connectionsByDoc.delete(docId);
  }

  close(code = 1000, reason = "Service closed") {
    if (this.wss) {
      this.wss.close(code, reason);
      this.wss = null;
    }
  }

  _attachPersistence(docId, ydoc) {
    const handleUpdate = async (update, origin) => {
      if (origin === "storage") {
        return;
      }
      await this.storage.saveDocUpdate(docId, update, ydoc.store.clients.size);
      this.logger.debug(`已持久化文档 ${docId} 的增量更新`);
    };

    ydoc.on("update", handleUpdate);
    this.docCleanupFns.set(docId, () => {
      ydoc.off("update", handleUpdate);
    });
  }

  _getDocConnections(docId) {
    if (!this.connectionsByDoc.has(docId)) {
      this.connectionsByDoc.set(docId, new Set());
    }
    return this.connectionsByDoc.get(docId);
  }

  _setPresence(docId, ws) {
    const awareness = this.awarenessByDoc.get(docId);
    if (!awareness) {
      return;
    }

    const state = awareness.getLocalState() || { users: {} };
    state.users = {
      ...(state.users || {}),
      [ws.id]: {
        id: ws.id,
        username: ws.username,
        isEditor: ws.isEditor,
      },
    };
    awareness.setLocalState(state);
  }

  _clearPresence(docId, wsId) {
    const awareness = this.awarenessByDoc.get(docId);
    if (!awareness) {
      return;
    }

    const state = awareness.getLocalState() || { users: {} };
    const nextUsers = { ...(state.users || {}) };
    delete nextUsers[wsId];
    awareness.setLocalState({ ...state, users: nextUsers });
  }

  _getPresenceList(docId) {
    const awareness = this.awarenessByDoc.get(docId);
    const state = awareness?.getLocalState();
    return Object.values(state?.users || {});
  }

  _materializeArray(yArray) {
    return yArray.toArray().map((item) => {
      if (item instanceof Y.Map) {
        return Object.fromEntries(item.entries());
      }
      return item;
    });
  }

  async _loadComments(docId) {
    if (typeof this.storage.getComments === "function") {
      return (await this.storage.getComments(docId)) || [];
    }
    return [];
  }

  async _loadHistory(docId) {
    if (typeof this.storage.getHistory === "function") {
      return (await this.storage.getHistory(docId)) || [];
    }
    if (typeof this.storage.getHistoryRecords === "function") {
      return this.storage.getHistoryRecords(docId) || [];
    }
    return [];
  }

  async _seedNewDoc(ydoc, docId, options) {
    const sharedSeed = await this._loadSharedSeed(options.seedFromDocId);
    if (sharedSeed) {
      Y.applyUpdate(ydoc, sharedSeed, "seed");
      return;
    }

    const personalSeed = await this._loadPersonalSeed(docId);
    if (!personalSeed) {
      return;
    }

    this._applyDocSeed(ydoc, personalSeed);
  }

  async _loadSharedSeed(seedFromDocId) {
    if (!seedFromDocId) {
      return null;
    }

    const savedState = await this.storage.loadDocState(seedFromDocId);
    return savedState?.update || null;
  }

  async _loadPersonalSeed(docId) {
    const personalMatch = /^personal:(?<pageId>[^:]+):(?<username>.+)$/.exec(docId);
    if (!personalMatch?.groups?.pageId) {
      return null;
    }

    const pageResult = await this.pageRepository.findOne(personalMatch.groups.pageId);
    if (!pageResult?.status) {
      return null;
    }

    const page = Array.isArray(pageResult.result)
      ? pageResult.result[0]
      : pageResult.result;

    if (!page?.content) {
      return null;
    }

    const rawContent =
      typeof page.content === "string" ? JSON.parse(page.content) : page.content;

    return {
      blockConfig: Array.isArray(rawContent) ? rawContent.map((item) => this._normalizeBlock(item)) : [],
      pageConfig: page.pageConfig ?? {},
    };
  }

  _applyDocSeed(ydoc, seedState) {
    const blockConfig = ydoc.getArray("blockConfig");
    if (Array.isArray(seedState.blockConfig) && seedState.blockConfig.length > 0) {
      blockConfig.push(seedState.blockConfig);
    }

    const pageConfig = ydoc.getMap("pageConfig");
    for (const [key, value] of Object.entries(seedState.pageConfig || {})) {
      pageConfig.set(key, value);
    }
  }

  _normalizeBlock(block) {
    return {
      id: block.id,
      code: block.code,
      formData: block.formData ?? block.value ?? {},
      children: block.children ?? [],
      nested: Boolean(block.nested),
      type: block.type ?? "",
      x: block.x,
      y: block.y,
    };
  }
}
