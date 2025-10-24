import Item from "../models/Item.js";
import Nursery from "../models/Nursery.js";
import StockLog from "../models/StockLog.js";

export const createItem = async (req, res) => {
  const { nurseryId, name, itemCode, category, subCategory,costPrice, price, quantity, unit, season, imageUrl } = req.body;

  try {
    // Create the item
    const newItem = await Item.create({
      nursery: nurseryId,
      name,
      itemCode,
      category,
      subCategory,
      costPrice,
      price,
      quantity,
      unit,
      season,
      imageUrl,
    });

    // Push the item into the nursery's item list
    await Nursery.findByIdAndUpdate(nurseryId, { $push: { items: newItem._id } });

    // Create a stock log entry for initial addition
    const newStrock =await StockLog.create({
      nursery: nurseryId,
      item: newItem._id,
      action: "added",
      quantityChanged: quantity,
      amount: costPrice * quantity,
      performedBy: req.user?._id || null, 
      note: "Initial stock added when item was created",
    });

   await Nursery.findByIdAndUpdate(nurseryId, { $push: { stockLogs: newStrock._id } });

    res.status(201).json({ msg: "Item added successfully", item: newItem, stockLog: newStrock });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ msg: "Failed to add item", error: error.message });
  }
};

// Get all items for a nursery
export const getItemsByNursery = async (req, res) => {
  const { nurseryId } = req.params;

  try {
    const items = await Item.find({ nursery: nurseryId }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch items", error });
  }
};

// Get a single item
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch item", error });
  }
};

// Update item details
export const updateItem = async (req, res) => {
  try {
    const { costPrice, price, quantity } = req.body;
    const itemId = req.params.id;

    // Require at least one field
    if (costPrice === undefined && price === undefined && quantity === undefined) {
      return res.status(400).json({
        msg: "Please provide at least one field to update (price, costPrice, or quantity)",
      });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ msg: "Item not found" });

    let stockLog = null;

    // Update price if provided
    if (price !== undefined) {
      item.price = price;
    }

    // Update cost price if provided
    if (costPrice !== undefined) {
      item.costPrice = costPrice;
    }

    // Handle quantity addition
    if (quantity !== undefined) {
      const addedQuantity = Number(quantity);
      if (isNaN(addedQuantity) || addedQuantity <= 0) {
        return res.status(400).json({ msg: "Quantity must be a positive number" });
      }

      // Add to existing quantity
      item.quantity += addedQuantity;

      // Create stock log for this addition
      const amount = addedQuantity * item.price;

      stockLog = await StockLog.create({
        nursery: item.nursery,
        item: item._id,
        action: "added",
        quantityChanged: addedQuantity,
        amount,
        performedBy: req.user?._id || null,
        note: `Added ${addedQuantity} to stock via updateItem`,
      });

      // Push stock log ID to nursery
      await Nursery.findByIdAndUpdate(item.nursery, {
        $push: { stockLogs: stockLog._id },
      });
    }

    await item.save();

    res.status(200).json({
      msg: "Item updated successfully",
      item,
      ...(stockLog && { stockLog }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to update item", error });
  }
};


export const deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ msg: "Item not found" });

    await Nursery.findByIdAndUpdate(deletedItem.nursery, { $pull: { items: id } });

    res.status(200).json({ msg: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to delete item", error });
  }
};
