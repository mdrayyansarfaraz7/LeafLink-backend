import Item from "../models/itemModel.js";
import Nursery from "../models/nurseryModel.js";

export const createItem = async (req, res) => {
  const { nurseryId, name, itemCode, category, subCategory, price, quantity, unit, season, imageUrl } = req.body;

  try {

    const newItem = await Item.create({
      nursery: nurseryId,
      name,
      itemCode,
      category,
      subCategory,
      price,
      quantity,
      unit,
      season,
      imageUrl,
    });

    await Nursery.findByIdAndUpdate(nurseryId, { $push: { items: newItem._id } });

    res.status(201).json({ msg: "Item added successfully", item: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to add item", error });
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
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ msg: "Item not found" });
    res.status(200).json({ msg: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to update item", error });
  }
};

// Delete an item
export const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ msg: "Item not found" });

    // Remove from nursery items list
    await Nursery.findByIdAndUpdate(deletedItem.nursery, { $pull: { items: id } });

    res.status(200).json({ msg: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to delete item", error });
  }
};
