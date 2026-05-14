import test from "node:test";
import assert from "node:assert/strict";
import * as Y from "yjs";
import { WebSocket } from "ws";
import { BasicCollabService } from "../services/y-collab/collab-basic-service.js";

function createLogger() {
  return {
    info() {},
    warn() {},
    error() {},
    debug() {},
  };
}

test("getOrCreateDoc loads an existing persisted Yjs document", async (t) => {
  const persistedDoc = new Y.Doc();
  persistedDoc.getMap("pageConfig").set("title", "loaded-from-storage");

  const storage = {
    async loadDocState(docId) {
      assert.equal(docId, "doc-1");
      return {
        update: Y.encodeStateAsUpdate(persistedDoc),
        version: 3,
      };
    },
    async saveDocUpdate() {
      return null;
    },
    async getComments() {
      return [];
    },
    async getHistory() {
      return [];
    },
  };

  const service = new BasicCollabService({ storage, logger: createLogger() });
  const { ydoc } = await service.getOrCreateDoc("doc-1");
  t.after(async () => {
    ydoc.destroy();
    await service.cleanupDoc("doc-1");
  });

  assert.equal(ydoc.getMap("pageConfig").get("title"), "loaded-from-storage");
});

test("document updates are persisted after the Yjs document changes", async (t) => {
  const saveCalls = [];
  const storage = {
    async loadDocState() {
      return null;
    },
    async saveDocUpdate(docId, update, version) {
      saveCalls.push({ docId, update, version });
    },
    async getComments() {
      return [];
    },
    async getHistory() {
      return [];
    },
  };

  const service = new BasicCollabService({ storage, logger: createLogger() });
  const { ydoc } = await service.getOrCreateDoc("doc-2");
  t.after(async () => {
    ydoc.destroy();
    await service.cleanupDoc("doc-2");
  });

  ydoc.getMap("pageConfig").set("title", "persist-me");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(saveCalls.length, 1);
  assert.equal(saveCalls[0].docId, "doc-2");
  assert.ok(saveCalls[0].version >= 1);

  const hydratedDoc = new Y.Doc();
  Y.applyUpdate(hydratedDoc, saveCalls[0].update);
  assert.equal(hydratedDoc.getMap("pageConfig").get("title"), "persist-me");
});

test("handleConnection sends current online presence to the connected client", async (t) => {
  const sentMessages = [];
  const ws = {
    readyState: WebSocket.OPEN,
    send(payload) {
      sentMessages.push(JSON.parse(payload));
    },
    on() {},
    close() {},
  };

  const storage = {
    async loadDocState() {
      return null;
    },
    async saveDocUpdate() {
      return null;
    },
    async getComments() {
      return [];
    },
    async getHistory() {
      return [];
    },
  };

  const service = new BasicCollabService({ storage, logger: createLogger() });
  t.after(async () => {
    await service.cleanupDoc("doc-3");
  });
  await service.handleConnection(ws, {
    url: "/?docId=doc-3&isEditor=true&username=alice",
  });

  const presenceMessage = sentMessages.find(
    (message) => message.type === "presence_update",
  );

  assert.ok(presenceMessage);
  assert.equal(presenceMessage.payload.docId, "doc-3");
  assert.equal(presenceMessage.payload.userCount, 1);
  assert.equal(presenceMessage.payload.users[0].username, "alice");
});

test("personal workspace seeds a new document from page content when no snapshot exists", async (t) => {
  const pageRepository = {
    async findOne(pageId) {
      assert.equal(pageId, "12");
      return {
        status: true,
        result: [
          {
            content: [
              {
                id: "block-a",
                code: "button",
                value: { content: { desktop: "Hello" } },
                children: [],
                nested: false,
                type: "component",
              },
            ],
          },
        ],
      };
    },
  };

  const storage = {
    async loadDocState() {
      return null;
    },
    async saveDocUpdate() {
      return null;
    },
    async getComments() {
      return [];
    },
    async getHistory() {
      return [];
    },
  };

  const service = new BasicCollabService({
    storage,
    pageRepository,
    logger: createLogger(),
  });
  const { ydoc } = await service.getOrCreateDoc("personal:12:alice");
  t.after(async () => {
    await service.cleanupDoc("personal:12:alice");
  });

  const seededBlocks = ydoc.getArray("blockConfig").toArray();
  assert.equal(seededBlocks.length, 1);
  assert.equal(seededBlocks[0].id, "block-a");
  assert.deepEqual(seededBlocks[0].formData, { content: { desktop: "Hello" } });
});

test("shared workspace seeds a new document from the source workspace snapshot", async (t) => {
  const sourceDoc = new Y.Doc();
  sourceDoc.getArray("blockConfig").push([
    {
      id: "shared-block",
      code: "button",
      formData: { content: { desktop: "Shared seed" } },
      children: [],
      nested: false,
      type: "component",
    },
  ]);

  const storage = {
    async loadDocState(docId) {
      if (docId === "shared:12:design-review") {
        return null;
      }
      if (docId === "personal:12:alice") {
        return {
          update: Y.encodeStateAsUpdate(sourceDoc),
          version: 1,
        };
      }
      return null;
    },
    async saveDocUpdate() {
      return null;
    },
    async getComments() {
      return [];
    },
    async getHistory() {
      return [];
    },
  };

  const service = new BasicCollabService({ storage, logger: createLogger() });
  const { ydoc } = await service.getOrCreateDoc("shared:12:design-review", {
    seedFromDocId: "personal:12:alice",
  });
  t.after(async () => {
    await service.cleanupDoc("shared:12:design-review");
  });

  const seededBlocks = ydoc.getArray("blockConfig").toArray();
  assert.equal(seededBlocks.length, 1);
  assert.equal(seededBlocks[0].id, "shared-block");
  assert.equal(
    seededBlocks[0].formData.content.desktop,
    "Shared seed",
  );
});
