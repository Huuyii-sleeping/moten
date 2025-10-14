// controller/performanceController.js
import {
  logPerformance,
  readPerformanceLogs,
} from "../performance/performance-logger.js";

export const performanceController = {
  // 上报组件性能数据
  reportComponent: async (req, res) => {
    try {
      const { componentName, componentId, duration, timestamp } = req.body;

      // 验证必需字段
      if (duration === undefined) {
        return res.status(400).json({
          success: false,
          message: "缺少必需字段: duration",
        });
      }

      // 记录性能日志
      await logPerformance({
        componentName,
        componentId,
        duration,
        timestamp: timestamp || Date.now(),
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });

      res.json({ success: true, message: "性能数据上报成功" });
    } catch (error) {
      console.error("性能数据上报失败:", error);
      res.status(500).json({ success: false, message: "服务器内部错误" });
    }
  },

  // 获取性能报告
  getReport: async (req, res) => {
    try {
      const {
        componentId,
        componentName,
        page = 1,
        limit = 50,
        startDate,
        endDate,
      } = req.query;

      const logs = await readPerformanceLogs({
        componentId,
        componentName,
        page,
        limit,
        startDate,
        endDate,
      });

      res.json({ success: true, data: logs });
    } catch (error) {
      console.error("获取性能报告失败:", error);
      res.status(500).json({ success: false, message: "服务器内部错误" });
    }
  },

  // 获取单个组件的性能报告
  getReportForComponent: async (req, res) => {
    try {
      const { componentId } = req.params;

      if (!componentId) {
        return res.status(400).json({
          success: false,
          message: "缺少组件ID",
        });
      }

      const logs = await readPerformanceLogs({
        componentId,
        limit: 1000, // 获取该组件的所有记录
      });

      if (logs.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "未找到该组件的性能数据",
        });
      }

      // 计算性能指标
      const durations = logs.data.map((log) => log.duration);
      const totalDuration = durations.reduce((sum, dur) => sum + dur, 0);
      const avgDuration = totalDuration / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      const report = {
        componentName: logs.data[0].componentName || componentId,
        componentId,
        avgDuration: parseFloat(avgDuration.toFixed(2)),
        maxDuration: parseFloat(maxDuration.toFixed(2)),
        minDuration: parseFloat(minDuration.toFixed(2)),
        renderCount: logs.data.length,
        lastDuration: durations[0] || 0,
        memoryUsage: Math.floor(Math.random() * 100), // 模拟内存使用
        records: logs.data.slice(0, 10), // 返回最近10条记录
      };

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("获取组件性能报告失败:", error);
      res.status(500).json({ success: false, message: "服务器内部错误" });
    }
  },
};
