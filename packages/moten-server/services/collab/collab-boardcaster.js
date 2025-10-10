import { isWsAvailable } from "./collab-utils.js";

export class CollabBroadcaster {
  constructor(storage) {
    this.storage = storage;
  }

  broadcast(docId, message, excludeWs = null) {
    const connections = this.storage.getConnections(docId);
    if (!connections) return;
    const messageStr = JSON.stringify(message);

    connections.forEach((ws) => {
      if (ws === excludeWs) return;
      if (isWsAvailable(ws)) {
        ws.send(messageStr);
      }
    });
  }

  broadcastUserUpdate(docId, type) {
    const userCount = this.storage.getUserCount(docId);
    this.broadcast(docId, {
      type,
      payload: { userCount },
    });
  }

  broadcastSelectionUpdate(docId, wsId, selection) {
    this.broadcast(docId, {
      type: "remote_selection",
      payload: {
        wsId,
        ...selection,
      },
    });
  }
}
