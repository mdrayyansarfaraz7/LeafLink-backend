import Transaction from "../models/Transaction.js";
import Item from "../models/Item.js";
import mongoose from "mongoose";

// Helper to convert nurseryId to ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ---------------------------
// 1️⃣ Monthly Revenue
// ---------------------------
export const getMonthlyRevenue = async (req, res) => {
  try {
    const nurseryId = req.user.nursery;

    const revenue = await Transaction.aggregate([
      { $match: { nursery: toObjectId(nurseryId) } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
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

    console.log("Monthly revenue aggregation result:", revenue);
    res.status(200).json(revenue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch monthly revenue", error });
  }
};

// ---------------------------
// 2️⃣ Monthly Items Sold
// ---------------------------
export const getMonthlyItemsSold = async (req, res) => {
  try {
    const nurseryId = req.user.nursery;

    const itemsSold = await Transaction.aggregate([
      { $match: { nursery: toObjectId(nurseryId) } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalQuantitySold: { $sum: "$items.quantity" },
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

    console.log("Monthly items sold aggregation result:", itemsSold);
    res.status(200).json(itemsSold);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch monthly items sold", error });
  }
};

// ---------------------------
// 3️⃣ Top Selling Items
// ---------------------------
export const getTopSellingItems = async (req, res) => {
  try {
    const nurseryId = req.user.nursery;

    const topItems = await Transaction.aggregate([
      { $match: { nursery: toObjectId(nurseryId) } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.item",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalSales: { $sum: "$items.priceAtSale" }, // sum of price at sale per item
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      {
        $project: {
          name: "$itemDetails.name",
          itemCode: "$itemDetails.itemCode",
          totalQuantitySold: 1,
          totalSales: 1,
        },
      },
    ]);

    console.log("Top selling items aggregation result:", topItems);
    res.status(200).json(topItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch top selling items", error });
  }
};

// ---------------------------
// 4️⃣ Current Stock Levels
// ---------------------------
export const getCurrentStockLevels = async (req, res) => {
  try {
    const nurseryId = req.user.nursery;

    const items = await Item.find({ nursery: nurseryId }, "name itemCode quantity").lean();

    const formatted = items.map((item) => ({
      name: item.name,
      itemCode: item.itemCode,
      currentStock: item.quantity,
    }));

    console.log("Current stock levels:", formatted);
    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch current stock levels", error });
  }
};

// ---------------------------
// 5️⃣ Monthly Profit/Loss
// ---------------------------
export const getMonthlyProfitLoss = async (req, res) => {
  try {
    const nurseryId = req.user.nursery;

    const profitLoss = await Transaction.aggregate([
      { $match: { nursery: toObjectId(nurseryId) } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalProfit: { $sum: "$totalProfit" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: 1,
          totalProfit: 1,
          _id: 0,
        },
      },
    ]);

    console.log("Monthly profit/loss aggregation result:", profitLoss);
    res.status(200).json(profitLoss);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch monthly profit/loss", error });
  }
};

// ---------------------------
// 6️⃣ Profit/Loss for Specific Month
// ---------------------------
export const getProfitLossForMonth = async (req, res) => {
  try {
    const nurseryId = req.user.nursery;
    const { year, month } = req.params;

    const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-${parseInt(month) + 1}-01T00:00:00.000Z`);

    const result = await Transaction.aggregate([
      {
        $match: {
          nursery: toObjectId(nurseryId),
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$totalProfit" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalProfit: 1,
          totalRevenue: 1,
        },
      },
    ]);

    console.log(`Profit/loss aggregation for ${year}-${month}:`, result);

    res.status(200).json({
      year: parseInt(year),
      month: parseInt(month),
      profitLoss: result[0]?.totalProfit || 0,
      totalRevenue: result[0]?.totalRevenue || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to fetch profit/loss for month", error });
  }
};
