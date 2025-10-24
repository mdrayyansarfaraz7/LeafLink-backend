import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    nursery: { type: mongoose.Schema.Types.ObjectId, ref: "Nursery", required: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, required: true },
        priceAtSale: { type: Number, required: true }, 
      },
    ],
    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
