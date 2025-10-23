import express from "express";
import {
  getCashiers,
  getUserById,
  toggleCashierStatus,
  getProfile
} from "../controllers/userController.js";

import { verifyUser, isManager } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Authenticated routes
router.use(verifyUser);

// Manager-only
router.get("/cashiers", isManager, getCashiers);
router.get("/cashiers/:id", isManager, getUserById);
router.patch("/cashiers/:id/toggle", isManager, toggleCashierStatus);

// Profile route for any user
router.get("/me", getProfile);

export default router;
