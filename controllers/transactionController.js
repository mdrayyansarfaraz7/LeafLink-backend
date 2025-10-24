import Transaction from "../models/Transaction.js";
import Item from "../models/Item.js";
import Nursery from "../models/Nursery.js";
import StockLog from "../models/StockLog.js";

export const createTransaction = async (req, res) => {
  const { nurseryId, items, paymentMethod } = req.body;
  const cashierId = req.user._id;

  try {
    let totalAmount = 0;
    let totalProfit = 0;

    // Validate nursery
    const nursery = await Nursery.findById(nurseryId);
    if (!nursery) return res.status(404).json({ msg: "Nursery not found" });

    // Process each sold item
    for (const sale of items) {
      const dbItem = await Item.findById(sale.item);
      if (!dbItem) return res.status(404).json({ msg: "Item not found" });

      if (dbItem.quantity < sale.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for ${dbItem.name}` });
      }

      // Deduct quantity
      dbItem.quantity -= sale.quantity;
      await dbItem.save();

      const saleAmount = dbItem.price * sale.quantity;
      const profit = (dbItem.price - (dbItem.costPrice || dbItem.price)) * sale.quantity;

      totalAmount += saleAmount;
      totalProfit += profit;

      // Create stock log
      const stockLog = await StockLog.create({
        nursery: nurseryId,
        item: dbItem._id,
        action: "sold",
        quantityChanged: sale.quantity,
        amount: saleAmount,
        performedBy: cashierId,
        note: `Sold ${sale.quantity} ${dbItem.unit} of ${dbItem.name}`,
      });

      await Nursery.findByIdAndUpdate(nurseryId, { $push: { stockLogs: stockLog._id } });
    }

    // Create transaction
    const transaction = await Transaction.create({
      nursery: nurseryId,
      cashier: cashierId,
      items,
      totalAmount,
      totalProfit,
      paymentMethod,
    });

    // Link transaction to nursery
    await Nursery.findByIdAndUpdate(nurseryId, { $push: { transactions: transaction._id } });

    res.status(201).json({
      msg: "Transaction recorded successfully",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Transaction failed", error });
  }
};
