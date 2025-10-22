import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    nursery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nursery",
      required: true,
    },
    name: { type: String, required: true },
    itemCode: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Plant", "Fertilizer", "Container", "Tool"],
      required: true,
    },
    subCategory: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ["pcs", "kg"], default: "pcs" },
    season: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
