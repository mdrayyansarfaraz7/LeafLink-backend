import express from "express";
import {
  registerManager,
  inviteCashier,
  activateCashier,
  loginUser,
  logoutUser
} from "../controllers/authController.js";

import { verifyUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Manager registration
router.post("/register", registerManager);

// Cashier activation
router.post("/activate", activateCashier);

// Login
router.post("/login", loginUser);

// Cashier invite (manager only)
router.post("/invite", verifyUser, inviteCashier);

router.post("/logout", verifyUser, logoutUser);

export default router;
