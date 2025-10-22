import mongoose from "mongoose";

const stockLogSchema = new mongoose.Schema(
  {
    nursery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nursery",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    action: {
      type: String,
      enum: ["added", "sold", "removed"],
      required: true,
    },
    quantityChanged: { type: Number, required: true },
    amount: { type: Number, required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  },
  { timestamps: true }
);

const StockLog = mongoose.model("StockLog", stockLogSchema);
export default StockLog;
