import Nursery from "../models/Nursery.js";
import Item from "../models/Item.js";
import Transaction from "../models/Transaction.js";
import StockLog from "../models/StockLog.js";

// Get detailed nursery info
export const getNurseryDetails = async (req, res) => {
  try {
    const nursery = await Nursery.findById(req.params.id)
      .populate("manager", "fullName email")
      .populate("cashiers", "fullName email")
      .populate("items")
      .populate("transactions")
      .populate("stockLogs");

    if (!nursery) {
      return res.status(404).json({ message: "Nursery not found" });
    }

    res.status(200).json(nursery);
  } catch (error) {
    res.status(500).json({ message: "Error fetching nursery details", error });
  }
};

// Nursery overview stats
export const getNurseryOverview = async (req, res) => {
  try {
    const nurseryId = req.params.id;

    const [itemCount, transactionCount, stockLogCount] = await Promise.all([
      Item.countDocuments({ nursery: nurseryId }),
      Transaction.countDocuments({ nursery: nurseryId }),
      StockLog.countDocuments({ nursery: nurseryId }),
    ]);

    res.status(200).json({
      nurseryId,
      stats: {
        totalItems: itemCount,
        totalTransactions: transactionCount,
        totalStockLogs: stockLogCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating overview", error });
  }
};
