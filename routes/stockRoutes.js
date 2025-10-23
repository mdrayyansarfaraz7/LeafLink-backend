import express from "express";
import {
  createStockLog,
  getAllStockLogs,
  getStockLogsByItem,
  getMonthlyRevenue,
  getTopSellingItems,
  getCurrentStockLevels,
} from "../controllers/stockLogController.js";

import { verifyUser, isManager } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyUser);

// Stock logs can be created and viewed by any user (manager or cashier)
router.post("/", createStockLog);
router.get("/", getAllStockLogs);
router.get("/item/:itemId", getStockLogsByItem);

// Analytics routes - manager only
router.get("/analytics/monthly-revenue", isManager, getMonthlyRevenue);
router.get("/analytics/top-selling", isManager, getTopSellingItems);
router.get("/analytics/current-stock", isManager, getCurrentStockLevels);

export default router;
