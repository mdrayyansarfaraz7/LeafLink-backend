import express from "express";
import {
  getMonthlyRevenue,
  getMonthlyItemsSold,
  getTopSellingItems,
  getCurrentStockLevels,
  getMonthlyProfitLoss
} from "../controllers/analyticsController.js";

import { verifyUser, isManager } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require logged-in user
router.use(verifyUser);

// Manager-only stats
router.get("/monthly-revenue", isManager, getMonthlyRevenue);
router.get("/monthly-items-sold", isManager, getMonthlyItemsSold);
router.get("/top-selling-items", isManager, getTopSellingItems);
router.get("/current-stock-levels", isManager, getCurrentStockLevels);
router.get("/monthly-profit-loss", isManager, getMonthlyProfitLoss);

export default router;
