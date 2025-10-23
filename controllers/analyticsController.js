import StockLog from "../models/StockLog.js";
import Item from "../models/Item.js";

// 1. Monthly Revenue
export const getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await StockLog.aggregate([
      { $match: { action: "purchased" } },
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

// 2. Monthly Items Sold
export const getMonthlyItemsSold = async (req, res) => {
  try {
    const sold = await StockLog.aggregate([
      { $match: { action: "purchased" } },
      {
        $group: {
          _id: { year: { $year: "$performedAt" }, month: { $month: "$performedAt" } },
          totalQuantitySold: { $sum: "$quantityChanged" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalQuantitySold: 1,
          _id: 0,
        },
      },
    ]);
    res.json(sold);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch monthly items sold", error });
  }
};

// 3. Top Selling Items
export const getTopSellingItems = async (req, res) => {
  try {
    const topItems = await StockLog.aggregate([
      { $match: { action: "purchased" } },
      {
        $group: {
          _id: "$item",
          totalQuantitySold: { $sum: "$quantityChanged" },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
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

// 4. Current Stock Levels
export const getCurrentStockLevels = async (req, res) => {
  try {
    const stockLevels = await StockLog.aggregate([
      {
        $group: {
          _id: "$item",
          totalAdded: { $sum: { $cond: [{ $eq: ["$action", "added"] }, "$quantityChanged", 0] } },
          totalPurchased: { $sum: { $cond: [{ $eq: ["$action", "purchased"] }, "$quantityChanged", 0] } },
          totalRemoved: { $sum: { $cond: [{ $eq: ["$action", "removed"] }, "$quantityChanged", 0] } },
        },
      },
      {
        $project: {
          currentStock: { $subtract: ["$totalAdded", { $add: ["$totalPurchased", "$totalRemoved"] }] },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      { $project: { itemCode: "$itemDetails.itemCode", name: "$itemDetails.name", currentStock: 1 } },
    ]);
    res.json(stockLevels);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch current stock levels", error });
  }
};

// 5. Monthly Profit/Loss
export const getMonthlyProfitLoss = async (req, res) => {
  try {
    const profitLoss = await StockLog.aggregate([
      {
        $group: {
          _id: { year: { $year: "$performedAt" }, month: { $month: "$performedAt" }, action: "$action" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          totalSales: { $sum: { $cond: [{ $eq: ["$_id.action", "purchased"] }, "$totalAmount", 0] } },
          totalCost: { $sum: { $cond: [{ $eq: ["$_id.action", "added"] }, "$totalAmount", 0] } },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          profitLoss: { $subtract: ["$totalSales", "$totalCost"] },
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);
    res.json(profitLoss);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch monthly profit/loss", error });
  }
};
