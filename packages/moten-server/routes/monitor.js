// routes/monitor.js
import express from "express";
import { logPerformance, logError, logVueError } from "../utils/fileLogger.js";

const router = express.Router();

// 性能监控
router.post("/performance", async (req, res) => {
  try {
    await logPerformance(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("性能日志写入失败:", err);
    res.status(500).json({ success: false });
  }
});

// JS 错误监控
router.post("/error", async (req, res) => {
  try {
    await logError(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("错误日志写入失败:", err);
    res.status(500).json({ success: false });
  }
});

// Vue 组件错误
router.post("/vue-error", async (req, res) => {
  try {
    await logVueError(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Vue 错误日志写入失败:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
