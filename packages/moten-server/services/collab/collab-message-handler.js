import pkg from "fast-json-patch";
import { generateUniqueId } from "./collab-utils.js";

const { applyPatch } = pkg;
export class CollabMessageHandler {
  constructor(storage, privateStorage, broadcaster) {
    this.storage = storage;
    this.privateStorage = privateStorage;
    this.broadcaster = broadcaster;
  }

  handleMessage(docId, ws, messageStr) {
    try {
      const { type, payload, version } = JSON.parse(messageStr);
      const isEditor = this.storage.getUserRole(docId, ws);
      if (!isEditor && type.startsWith("update_")) {
        console.warn(
          `[Permission] Read-only user (${ws.id}) tried to edit doc: ${docId}`
        );
        this._sendPermissionDenied(ws);
        return;
      }
      switch (type) {
        case "private_update_block_config":
          console.log('private_update_block_config')
          this._handleBlockConfigUpdate(docId, payload, ws, true);
          break;
        case "update_block_config":
          this._handleBlockConfigUpdate(docId, payload, ws);
          break;
        case "private_update_page_config":
          this._handlePageConfigUpdate(docId, payload, ws, true);
          break;
        case "update_page_config":
          this._handlePageConfigUpdate(docId, payload, ws);
          break;
        case "private_update_page_config":
          this._handleFullStateUpdate(docId, payload, ws, true);
        case "update_full_state":
          this._handleFullStateUpdate(docId, payload, ws);
          break;
        case "user_selection":
          this._handleUserSelection(docId, ws, payload);
          break;
        case "block_operation":
          this._handleBlockOperation(docId, payload, ws);
          break;
        case "update_block_delta":
          this._handleBlockDeltaUpdate(docId, payload, version, ws);
          break;
        case "add_comment":
          this._handleAddComment(docId, payload, ws);
          break;
        case "resolve_comment":
          this._handleResolveComment(docId, payload.id);
          break;
        case "get_comments":
          this._sendComments(docId, ws);
          break;
        case "get_history":
          this._sendHistory(docId, ws);
          break;
        case "get_userlist":
          this._sendUserList(docId);
          break;
        case "dismiss_room":
          this._dismissRoom(docId);
        default:
          console.warn(`[Unknown Type] Message type not supported: ${type}`);
          this._sendUnknownTypeError(ws, type);
          break;
      }
    } catch (error) {
      console.error(`[Message Error] Failed to handle message:`, error);
      this._sendMessageParseError(ws);
    }
  }

  _dismissRoom(docId) {
    const connections = this.storage.connections.get(docId);
    if (!connections) return;
    this.broadcaster.broadcast(docId, {
      type: "room_dismissed",
      payload: {
        reason: "房间已经解散",
      },
    });
    connections.forEach((ws) => {
      ws.close(1000, "Room dismissed by host");
    });

    this.storage.clearDocStorage(docId);
  }

  _sendUserList(docId) {
    const userList = this.storage.getAllUser(docId);
    this.broadcaster.broadcast(docId, {
      type: "all_users",
      payload: userList,
    });
  }

  _handleBlockConfigUpdate(docId, blockConfig, ws, isPrivate = false) {
    const currentState = this.storage.getDocState(docId);
    if (!currentState) return;

    // 1. 生成新文档状态（版本号+1）
    const newState = {
      ...currentState,
      blockConfig,
      version: currentState.version + 1,
    };

    if (isPrivate) {
      this.privateStorage.updateDocDate(docId, newState);
    } else {
      this.storage.updateDocState(docId, newState);
      const historyRecord = this._createHistoryRecord(
        ws.id,
        "block_config_update",
        { blockConfig },
        newState.version
      );
      this.storage.addHistoryRecord(docId, historyRecord);

      this.broadcaster.broadcast(
        docId,
        {
          type: "block_config_updated",
          payload: newState,
        },
        ws
      );
    }
  }

  _handlePageConfigUpdate(docId, pageConfig, ws, isPrivate = false) {
    const currentState = this.storage.getDocState(docId);
    if (!currentState) return;

    const newState = {
      ...currentState,
      pageConfig: { ...currentState.pageConfig, ...pageConfig }, // 增量合并
      version: currentState.version + 1,
    };

    if (isPrivate) {
      this.privateStorage.updateDocDate(docId, newState);
    } else {
      this.storage.updateDocState(docId, newState);
      const historyRecord = this._createHistoryRecord(
        ws.id,
        "page_config_update",
        { pageConfig },
        newState.version
      );
      this.storage.addHistoryRecord(docId, historyRecord);

      this.broadcaster.broadcast(
        docId,
        {
          type: "page_config_updated",
          payload: newState,
        },
        ws
      );
    }
  }

  _handleFullStateUpdate(docId, fullState, ws, isPrivate = false) {
    const currentState = this.storage.getDocState(docId);
    if (!currentState) return;

    const newState = {
      ...currentState,
      ...fullState,
      version: currentState.version + 1,
    };

    if (isPrivate) {
      this.privateStorage.updateDocData(docId, newState);
    } else {
      this.storage.updateDocState(docId, newState);

      const historyRecord = this._createHistoryRecord(
        ws.id,
        "full_state_update",
        { blockConfig: newState.blockConfig, pageConfig: newState.pageConfig },
        newState.version
      );
      this.storage.addHistoryRecord(docId, historyRecord);

      this.broadcaster.broadcast(
        docId,
        {
          type: "full_state_updated",
          payload: newState,
        },
        ws
      );
    }
  }

  _handleUserSelection(docId, ws, selection) {
    // 1. 更新存储中的选中状态
    this.storage.setUserSelection(docId, ws, selection);

    // 2. 广播选中状态（所有用户可见，无需排除发送者）
    this.broadcaster.broadcastSelectionUpdate(docId, ws.id, selection);
  }

  _handleBlockOperation(docId, operation, ws) {
    const currentState = this.storage.getDocState(docId);
    if (!currentState) return;

    const { op, id, block, formData, fromIndex, toIndex } = operation;
    let updatedBlockConfig = [...currentState.blockConfig]; // 复制避免直接修改原数组

    // 按操作类型处理区块
    switch (op) {
      case "add":
        // 添加新区块（确保有唯一ID）
        if (block) {
          updatedBlockConfig.push({
            ...block,
            id: block.id || generateUniqueId(),
          });
        }
        break;
      case "update":
        // 更新现有区块的formData
        const updateIndex = updatedBlockConfig.findIndex(
          (item) => item.id === id
        );
        if (updateIndex !== -1) {
          updatedBlockConfig[updateIndex].formData = {
            ...updatedBlockConfig[updateIndex].formData,
            ...formData,
          };
        }
        break;
      case "delete":
        // 删除指定ID的区块
        updatedBlockConfig = updatedBlockConfig.filter(
          (item) => item.id !== id
        );
        break;
      case "move":
        // 移动区块（从fromIndex到toIndex）
        if (
          fromIndex >= 0 &&
          toIndex >= 0 &&
          fromIndex < updatedBlockConfig.length
        ) {
          const [movedBlock] = updatedBlockConfig.splice(fromIndex, 1);
          updatedBlockConfig.splice(toIndex, 0, movedBlock);
        }
        break;
      default:
        console.warn(`[Invalid Op] Block operation not supported: ${op}`);
        return;
    }

    // 1. 生成新文档状态（版本号+1）
    const newState = {
      ...currentState,
      blockConfig: updatedBlockConfig,
      version: currentState.version + 1,
    };

    // 2. 更新存储
    this.storage.updateDocState(docId, newState);

    // 3. 记录操作历史
    const historyRecord = this._createHistoryRecord(
      ws.id,
      `block_${op}`,
      { operation },
      newState.version
    );
    this.storage.addHistoryRecord(docId, historyRecord);

    // 4. 广播操作结果（排除发送者）
    this.broadcaster.broadcast(
      docId,
      {
        type: "block_operation_done",
        payload: {
          operation,
          newBlockConfig: updatedBlockConfig,
          version: newState.version,
        },
      },
      ws
    );
  }

  _handleBlockDeltaUpdate(docId, patches, clientVersion, ws) {
    const currentState = this.storage.getDocState(docId);
    if (!currentState) return;

    // 1. 版本冲突检测：客户端版本低于服务端，拒绝应用并返回最新数据
    if (clientVersion < currentState.version) {
      this.broadcaster.broadcast(
        docId,
        {
          type: "conflict_detected",
          payload: {
            expectedVersion: currentState.version,
            currentBlocks: currentState.blockConfig, // 返回最新区块数据供客户端同步
            message:
              "Client version is outdated, please sync latest data first",
          },
        },
        ws
      );
      return;
    }

    try {
      // 2. 应用JSON Patch增量（true表示严格模式，非法操作会抛错）
      const { newDocument } = applyPatch(currentState, patches, true);

      // 3. 生成新文档状态（版本号+1）
      const newState = {
        ...newDocument,
        version: currentState.version + 1,
      };

      // 4. 更新存储
      this.storage.updateDocState(docId, newState);

      // 5. 记录操作历史
      const historyRecord = this._createHistoryRecord(
        ws.id,
        "block_delta_update",
        { patches },
        newState.version
      );
      this.storage.addHistoryRecord(docId, historyRecord);

      // 6. 广播增量更新结果（所有用户需应用该增量，排除发送者）
      this.broadcaster.broadcast(
        docId,
        {
          type: "block_delta_applied",
          payload: { patches, version: newState.version },
        },
        ws
      );
    } catch (patchError) {
      console.error(`[Patch Error] Failed to apply JSON Patch:`, patchError);
      this._sendPatchApplyError(ws, patchError.message);
    }
  }

  _handleAddComment(docId, commentData, ws) {
    // 1. 补全评论字段（生成ID、作者、时间戳）
    const comment = {
      id: generateUniqueId(),
      ...commentData,
      authorId: ws.id,
      createdAt: Date.now(),
      resolved: false,
      username: this.storage.getUsername(docId, ws),
    };

    // 2. 存储评论
    this.storage.addComment(docId, comment);

    // 3. 广播新评论（所有用户可见）
    this.broadcaster.broadcast(docId, {
      type: "comment_added",
      payload: comment,
    });
  }

  _handleResolveComment(docId, commentId) {
    const comments = this.storage.comments.get(docId);
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      comment.resolved = true;
      this.broadcaster.broadcast(docId, {
        type: "comment_resolved",
        payload: { id: commentId },
      });
    }
  }

  _sendComments(docId, ws) {
    const comments = this.storage.getComments(docId);
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "comment_list",
          payload: comments,
        })
      );
    }
  }

  _sendHistory(docId, ws) {
    const history = this.storage.getHistoryRecords(docId);
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "history_records",
          payload: history,
        })
      );
    }
  }

  _createHistoryRecord(userId, operation, data, version) {
    return {
      id: generateUniqueId(),
      timestamp: Date.now(),
      userId,
      operation,
      data,
      version,
    };
  }

  _sendPermissionDenied(ws) {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "PERMISSION_DENIED",
          message: "Read-only users are not allowed to perform edit operations",
        })
      );
    }
  }

  _sendMessageParseError(ws) {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "MESSAGE_PARSE_ERROR",
          message: "Failed to parse message, please send valid JSON",
        })
      );
    }
  }

  _sendUnknownTypeError(ws, type) {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "UNKNOWN_MESSAGE_TYPE",
          message: `Message type "${type}" is not supported`,
          data: { type },
        })
      );
    }
  }

  _sendPatchApplyError(ws, reason) {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "PATCH_APPLY_FAILED",
          message: `Failed to apply JSON Patch: ${reason}`,
          data: { reason },
        })
      );
    }
  }

  _sendCommentNotFoundError(ws, commentId) {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "error",
          code: "COMMENT_NOT_FOUND",
          message: `Comment with ID "${commentId}" does not exist`,
          data: { commentId },
        })
      );
    }
  }
}
