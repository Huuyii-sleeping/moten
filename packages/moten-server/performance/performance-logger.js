import { appendFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ensurePerformanceLogDir = async () => {
  const logDir = `${__dirname}/../logs/performance`;
  try {
    await mkdir(logDir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  return logDir;
};

export const logPerformance = async (data) => {
  await ensurePerformanceLogDir();
  const logPath = `${__dirname}/../logs/performance/performance.log`;
  const logEntry = {
    ...data,
    timestamp: Date.now(),
    id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
  };
  const logLine = JSON.stringify(logEntry) + "\n";
  try {
    await appendFile(logPath, logLine, "utf-8");
    console.log(
      "✅ 性能日志写入成功:",
      logEntry.componentName || logEntry.componentId
    );
  } catch (error) {
    console.error("❌ 性能日志写入失败:", err);
  }
};

export const readPerformanceLogs = async (options = {}) => {
  const {
    componentId,
    componentName,
    page = 1,
    limit = 50,
    startDate,
    endDate,
  } = options;
  const logPath = `${__dirname}/../logs/performance/performance.log`;
  try {
    const fs = await import("fs");
    if (!fs.existsSync(logPath)) {
      return { data: [], total: 0, page, limit };
    }
    const content = await fs.promises.readFile(logPath, "utf-8");
    const lines = content
      .trim()
      .split("\n")
      .filter((line) => line);
    let logs = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
    if (componentId) {
      logs = logs.filter((log) => log.componentId === componentId);
    }
    if (componentName) {
      logs = logs.filter((log) => log.componentName === componentName);
    }
    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter((log) => new Date(log.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      logs = logs.filter((log) => new Date(log.timestamp) <= end);
    }
    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = logs.slice(startIndex, startIndex + limit);

    return {
      data: paginatedLogs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  } catch (error) {
    console.error("❌ 读取性能日志失败:", err);
    return { data: [], total: 0, page: 1, limit: 50 };
  }
};
