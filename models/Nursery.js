import mongoose from "mongoose";

const nurserySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    contactNumber: { type: String },
    email: { type: String },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cashiers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    items: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Item" }
    ],

    stockLogs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "StockLog" }
    ],

    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }
    ]
  },
  { timestamps: true }
);

const Nursery = mongoose.model("Nursery", nurserySchema);
export default Nursery;
