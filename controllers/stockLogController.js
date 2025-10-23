import StockLog from "../models/StockLog.js";
import Item from "../models/Item.js";
import Nursery from "../models/Nursery.js";

// Create a new stock log
export const createStockLog = async (req, res) => {
  const { itemId, action, quantityChanged, amount, note } = req.body;
  const nurseryId = req.user.nursery; // user must be linked to nursery

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ msg: "Item not found" });

    // Create stock log
    const log = await StockLog.create({
      item: item._id,
      nursery: nurseryId,
      action,
      quantityChanged,
      amount,
      note,
    });

    // Push log ID to nursery document
    await Nursery.findByIdAndUpdate(nurseryId, { $push: { stockLogs: log._id } });

    res.status(201).json({ msg: "Stock log created", log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to create stock log", error });
  }
};

// Get all logs for a nursery
export const getAllStockLogs = async (req, res) => {
  try {
    const logs = await StockLog.find({ nursery: req.user.nursery })
      .populate("item", "name itemCode category")
      .sort({ performedAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch logs", error });
  }
};

// Get logs for a specific item
export const getStockLogsByItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const logs = await StockLog.find({ nursery: req.user.nursery, item: itemId }).populate(
      "item",
      "name itemCode"
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch item logs", error });
  }
};

// Analytics: Monthly Revenue
export const getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await StockLog.aggregate([
      { $match: { nursery: req.user.nursery, action: "purchased" } },
      {
        $group: {
          _id: { year: { $year: "$performedAt" }, month: { $month: "$performedAt" } },
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch monthly revenue", error });
  }
};

// Analytics: Top Selling Items
export const getTopSellingItems = async (req, res) => {
  try {
    const topItems = await StockLog.aggregate([
      { $match: { nursery: req.user.nursery, action: "purchased" } },
      { $group: { _id: "$item", totalQuantitySold: { $sum: "$quantityChanged" } } },
      { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "itemDetails" } },
      { $unwind: "$itemDetails" },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
      {
        $project: {
          itemCode: "$itemDetails.itemCode",
          name: "$itemDetails.name",
          totalQuantitySold: 1,
        },
      },
    ]);
    res.json(topItems);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch top selling items", error });
  }
};

// Analytics: Current Stock Levels
export const getCurrentStockLevels = async (req, res) => {
  try {
    const stock = await StockLog.aggregate([
      { $match: { nursery: req.user.nursery } },
      {
        $group: {
          _id: "$item",
          totalAdded: { $sum: { $cond: [{ $eq: ["$action", "added"] }, "$quantityChanged", 0] } },
          totalPurchased: {
            $sum: { $cond: [{ $eq: ["$action", "purchased"] }, "$quantityChanged", 0] },
          },
          totalRemoved: { $sum: { $cond: [{ $eq: ["$action", "removed"] }, "$quantityChanged", 0] } },
        },
      },
      {
        $project: {
          currentStock: { $subtract: ["$totalAdded", { $add: ["$totalPurchased", "$totalRemoved"] }] },
        },
      },
      {
        $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "itemDetails" },
      },
      { $unwind: "$itemDetails" },
      { $project: { itemCode: "$itemDetails.itemCode", name: "$itemDetails.name", currentStock: 1 } },
    ]);
    res.json(stock);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch stock levels", error });
  }
};
