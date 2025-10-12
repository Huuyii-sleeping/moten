// utils/fileLogger.js
import { appendFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保日志目录存在
const ensureLogDir = async (subDir) => {
  const logDir = `${__dirname}/../logs/${subDir}`;
  try {
    await mkdir(logDir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  return logDir;
};

// 写入日志（带时间戳 + JSON 格式）
export const writeLog = async (subDir, filename, data) => {
  await ensureLogDir(subDir);
  const logPath = `${__dirname}/../logs/${subDir}/${filename}`;

  const logEntry = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  // 每行一个 JSON 对象（便于后续解析）
  const logLine = JSON.stringify(logEntry) + "\n";

  try {
    await appendFile(logPath, logLine, "utf8");
  } catch (err) {
    console.error("写入日志失败:", err);
  }
};

// 导出具体日志方法
export const logPerformance = (data) =>
  writeLog("monitor", "performance.log", { type: "performance", ...data });

export const logError = (data) =>
  writeLog("monitor", "error.log", { type: "error", ...data });

export const logVueError = (data) =>
  writeLog("monitor", "vue-error.log", { type: "vue-error", ...data });

export const logAudit = (data) =>
  writeLog("audit", "audit.log", { type: "audit", ...data });
