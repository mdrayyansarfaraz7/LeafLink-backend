import express from "express";
import { createTransaction } from "../controllers/transactionController.js";
import { isCashier, verifyUser } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/",verifyUser, isCashier, createTransaction);

export default router;
