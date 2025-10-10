import { CollabBroadcaster } from "./collab-boardcaster.js";
import { CollabMessageHandler } from "./collab-message-handler.js";
import { CollabStorage } from "./collab-storage.js";
import { generateUniqueId, parseWsParams } from "./collab-utils.js";
import { WebSocketServer } from "ws";
export class BasicCollabService {
  constructor() {
    this.storage = new CollabStorage();
    this.broadcaster = new CollabBroadcaster(this.storage);
    this.messageHandler = new CollabMessageHandler(
      this.storage,
      this.broadcaster
    );
  }

  init(server, options = {}) {
    const { closeDelay = 0 } = options;
    this.wss = new WebSocketServer({ server });
    console.log("[Collab Service] WebSocket server initialized");

    this.wss.on("connection", (ws, req) => {
      ws.id = generateUniqueId();
      console.log(`[Connection] New WebSocket connection (ID: ${ws.id})`);
      const { docId, isEditor, username } = parseWsParams(req.url);
      if (!docId) {
        console.warn(
          `[Connection] Rejected: Missing "docId" parameter (ID: ${ws.id})`
        );
        ws.close(400, "Missing required parameter: docId");
        return;
      }
      this._sendInitialData(ws, docId);
      this.storage.initDocument(docId);
      this.storage.setUserRole(docId, ws, isEditor);
      this.storage.addConnection(docId, ws);
      this.storage.setUsername(docId, ws, username);
      this.storage.addUser(docId, ws, username);

      const newUserCount = this.storage.getUserCount(docId) + 1;
      this.storage.updateUserCount(docId, newUserCount);
      this.broadcaster.broadcastUserUpdate(docId, "user_joined");
      console.log(
        `[Document] User ${ws.id} joined doc ${docId} (current users: ${newUserCount})`
      );

      ws.on("message", (data) => {
        console.log(
          `[Message] Received from ${ws.id} (doc ${docId}): ${data.slice(
            0,
            50
          )}...`
        );
        this.messageHandler.handleMessage(docId, ws, data.toString());
      });

      ws.on("close", (code, reason) => {
        console.log(
          `[Connection] WebSocket closed (ID: ${
            ws.id
          }, Code: ${code}, Reason: ${reason.toString()})`
        );
        this.storage.removeConnection(docId, ws);

        const currentCount = this.storage.getUserCount(docId);
        const newUserCount = Math.max(0, currentCount - 1);
        this.storage.updateUserCount(docId, newUserCount);
        this.storage.removeUser(docId, ws.id);

        this.broadcaster.broadcastUserUpdate(docId, "user_left");
        console.log(
          `[Document] User ${ws.id} left doc ${docId} (current users: ${newUserCount})`
        );

        if (newUserCount === 0) {
          setTimeout(() => {
            if (this.storage.getUserCount(docId) === 0) {
              this.storage.clearDocStorage(docId);
              console.log(
                `[Document] All users left doc ${docId}, storage cleared`
              );
            }
          }, closeDelay);
        }
      });
    });

    this.wss.on("error", (error) => {
      console.error("[WebSocket Server Error]:", error);
    });

    this.wss.on("close", () => {
      console.log("[Collab Service] WebSocket server closed");
    });
  }

  close(code = 1000, reason = "Service closed") {
    if (this.wss) {
      this.wss.close(code, reason);
      this.wss = null;
      console.log(`[Collab Service] Closed (Code: ${code}, Reason: ${reason})`);
    }
  }

  _sendInitialData(ws, docId) {
    if (!ws.readyState === 1) return;
    const initialData = {
      ...this.storage.getDocState(docId),
      userCount: this.storage.getUserCount(docId),
      comments: this.storage.getComments(docId),
      history: this.storage.getHistoryRecords(docId).slice(-20),
    };

    ws.send(
      JSON.stringify({
        type: "initial_data",
        payload: initialData,
        timestamp: Date.now(),
      })
    );
    console.log(
      `[Data Sync] Sent initial data to user ${ws.id} (doc ${docId})`
    );
  }

  forceSyncDoc(docId) {
    const docState = this.storage.getDocState(docId);
    if (!docState) return;

    // 广播全量状态更新
    this.broadcaster.broadcast(docId, {
      type: "force_sync",
      payload: { docState, timestamp: Date.now() },
    });
    console.log(`[Data Sync] Forced sync for doc ${docId}`);
  }

  getDocCurrentState(docId) {
    return this.storage.getDocState(docId);
  }

  getDocUserCount(docId) {
    return this.storage.getUserCount(docId);
  }
}
