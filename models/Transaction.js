import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    nursery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nursery",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who performed the transaction (manager/cashier)
    },
    type: {
      type: String,
      enum: ["sale", "purchase", "expense"], // sale = customer payment, purchase = bought stock, expense = misc
      required: true,
    },
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // price per unit
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: "cash",
    },
    note: { type: String }, // optional description
    performedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
