import express from "express";
import {
  createItem,
  getItemsByNursery,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

router.post("/add", createItem);

router.get("/nursery/:nurseryId", getItemsByNursery);

router.get("/:id", getItemById);

router.put("/:id", updateItem);


router.delete("/:id", deleteItem);

export default router;
