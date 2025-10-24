import express from "express";
import {
  getMonthlyRevenue,
  getMonthlyItemsSold,
  getTopSellingItems,
  getCurrentStockLevels,
  getMonthlyProfitLoss,
  getProfitLossForMonth
} from "../controllers/analyticsController.js";

import { verifyUser, isManager } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require logged-in user
router.use(verifyUser);

// Manager-only stats
router.get("/monthly-revenue",verifyUser, isManager, getMonthlyRevenue);
router.get("/monthly-items-sold",verifyUser, isManager, getMonthlyItemsSold);
router.get("/top-selling-items",verifyUser, isManager, getTopSellingItems);
router.get("/current-stock-levels",verifyUser, isManager, getCurrentStockLevels);
router.get("/monthly-profit-loss",verifyUser, isManager, getMonthlyProfitLoss);
router.get("/profit-loss/:year/:month", verifyUser, isManager, getProfitLossForMonth);

export default router;
