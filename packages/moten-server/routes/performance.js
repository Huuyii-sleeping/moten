import express from "express";
import { performanceController } from "../controller/performance.controller.js";

const router = express.Router();

// 上报组件性能数据
router.post("/api/performance/component", performanceController.reportComponent);

// 获取性能报告（支持查询参数）
router.get("/api/performance/report", performanceController.getReport);

// 获取指定组件的性能报告
router.get("/api/performance/report/:componentId", performanceController.getReportForComponent);

export default router;
