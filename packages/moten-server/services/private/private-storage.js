export class PrivateStorage {
  constructor() {
    // docId -> DocumentDate = blockConfig + pageConfig + version
    this.docData = new Map();
  }

  initDocument(docId) {
    if (!this.docData.get(docId)) this.docData.set(docId, {});
  }

  getDocDate(docId) {
    return this.docData.get(docId) || {};
  }

  updateDocDate(docId, newState, autoIncrementVersion = true) {
    if (!this.docData.get(docId)) {
      throw new Error(`[PrivateStorage] 文档未初始化,无法更新!docId: ${docId}`);
    }
    const finalState = {
      ...newState,
      version: autoIncrementVersion
        ? (this.docData.get(docId).version || 0) + 1
        : newState.version || 0,
    };

    this.docData.set(docId, finalState);
    console.log(`[PrivateStorage] 文档更新完成,docId: ${docId}`, {
      oldVersion: this.docData.get(docId).version - 1,
      newVersion: finalState.version,
    });
    console.log('???:', this.docData.get(docId))
  }
  deleteDocument(docId) {
    const isDeleted = this.docData.delete(docId);
    if (isDeleted) {
      console.log(`[PrivateStorage] 文档已删除,docId: ${docId}`);
    } else {
      console.warn(`[PrivateStorage] 文档不存在,无需删除,docId: ${docId}`);
    }
    return isDeleted;
  }

  getAllDocIds() {
    return Array.from(this.docData.keys());
  }

  clearAllDocuments() {
    const document = this.docData.size;
    this.docData.clear();
    console.log(
      `[PrivateStorage] 所有私有文档已清空，共删除 ${document} 个文档`
    );
  }

  hasDocumnet(docId) {
    return this.docData.has(docId);
  }
}
