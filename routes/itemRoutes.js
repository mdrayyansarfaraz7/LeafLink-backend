import express from "express";
import {
  createItem,
  getItemsByNursery,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

router.post("/", createItem);


router.get("/nursery/:nurseryId", getItemsByNursery);

// Get a single item by ID
router.get("/:id", getItemById);

// Update an item by ID
router.put("/:id", updateItem);

// Delete an item by ID
router.delete("/:id", deleteItem);

export default router;
