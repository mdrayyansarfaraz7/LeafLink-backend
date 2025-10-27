import express from "express";
import {
  createItem,
  getItemsByNursery,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import upload from "../utils/upload.js";

import { verifyUser, isManager } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyUser, isManager, upload.single('photo'), createItem);

router.get("/nursery/:nurseryId", getItemsByNursery);

router.get("/:id", getItemById);

router.put("/:id", updateItem);


router.delete("/:id", deleteItem);

export default router;
