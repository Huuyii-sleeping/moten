import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Awareness } from "y-protocols/awareness";
import { CollabStorage } from "../collab/collab-storage";
import { CollabBroadcaster } from "../collab/collab-boardcaster";
import { WebSocketServer } from "ws";
import { parseWsParams } from "../collab/collab-utils";

export class BasicCollabService {
  constructor() {
    this.yDocs = new Map();
    this.awareness = new Map();
    this.storage = new CollabStorage();
    this.boardcaster = new CollabBroadcaster();
  }

  init(server) {
    this.wss = new WebSocketServer({ server });
    this.wss.on("connection", (ws, req) => {
      const { docId, isEditor, username } = parseWsParams(req.url);
      if (!docId) {
        ws.close(400, "Messing docId");
        return;
      }
      if (!this.yDocs.has(docId)) {
        const ydoc = new Y.Doc();
        this.yDocs.set(docId, new Awareness(ydoc));
        this.awareness.set(docId, new Awareness(ydoc));
      }
      const ydoc = this.yDocs.get(docId);
      const awareness = this.awareness.get(docId);

      const provider = new WebsocketProvider("", docId, ydoc, {
        websocket: ws,
      });
      ydoc.on("update", (update) => {
        const blockConfig = Array.from(ydoc.getArray("blockConfig"));
        this.storage.updateDocState(docId, {
          blockConfig,
          version: ydoc.version,
        });
      });
      this.storage.addConnection(docId, ws);
      ws.on("close", () => {
        provider.destroy();
        this.storage.removeConnection(docId, ws);
        if (this.storage.getUserCount(docId) === 0) {
          this.yDocs.delete(docId);
          this.awareness.delete(docId);
        }
      });
    });
  }
}
