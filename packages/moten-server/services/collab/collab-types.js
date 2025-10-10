/**
 * @typedef {Object} DocumentState
 * @property {BlockConfig[]} blockConfig - 文档区块配置列表
 * @property {PageConfig} pageConfig - 文档页面配置
 * @property {number} version - 文档版本号（用于冲突检测）
 */

/**
 * @typedef {Object} BlockConfig
 * @property {string} id - 区块唯一ID
 * @property {string} type - 区块类型（如文本、图片、表格）
 * @property {Object} formData - 区块表单数据
 */

/**
 * @typedef {Object} PageConfig
 * @property {string} title - 页面标题
 * @property {string} layout - 页面布局（如单栏、双栏）
 * @property {Object} style - 页面样式（背景、边距等）
 */

/**
 * @typedef {Object} UserSelection
 * @property {string} blockId - 选中的区块ID
 * @property {number} start - 选中起始位置
 * @property {number} end - 选中结束位置
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - 评论唯一ID
 * @property {string} blockId - 关联区块ID
 * @property {string} content - 评论内容
 * @property {string} authorId - 评论者ID（WebSocket连接ID）
 * @property {number} createdAt - 创建时间戳（ms）
 * @property {boolean} resolved - 是否已解决
 */

/**
 * @typedef {Object} HistoryRecord
 * @property {string} id - 历史记录ID
 * @property {number} timestamp - 操作时间戳（ms）
 * @property {string} userId - 操作用户ID
 * @property {string} operation - 操作类型（如block_config_update、page_config_update）
 * @property {BlockConfig[]|PageConfig} data - 操作关联数据
 * @property {number} version - 操作后的文档版本
 */

// 导出类型供其他模块引用（JSDoc类型无需运行时导出，仅作提示）
module.exports = {};
