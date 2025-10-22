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
    cashiers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const Nursery = mongoose.model("Nursery", nurserySchema);
export default Nursery;
