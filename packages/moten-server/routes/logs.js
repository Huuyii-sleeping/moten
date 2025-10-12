// routes/logs.js
import express from "express";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOGS_DIR = join(__dirname, "../logs");

// 读取监控日志（带分页）
router.get("/monitor/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const validTypes = ["performance", "error", "vue-error"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "无效的日志类型" });
    }

    const logPath = join(LOGS_DIR, "monitor", `${type}.log`);
    const content = await readFile(logPath, "utf8");

    // 解析 JSONL（每行一个 JSON）
    const lines = content
      .trim()
      .split("\n")
      .filter((line) => line);
    const logs = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .reverse() // 最新在前
      .slice(offset, offset + parseInt(limit));

    res.json({
      data: logs,
      total: lines.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      res.json({ data: [], total: 0, page: 1, limit: 50 });
    } else {
      console.error("读取日志失败:", err);
      res.status(500).json({ error: "读取失败" });
    }
  }
});

// 读取审计日志
router.get("/audit", async (req, res) => {
  // 类似实现...
});

export default router;
