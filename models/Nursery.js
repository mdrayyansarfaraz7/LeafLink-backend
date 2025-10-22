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
  },
  { timestamps: true }
);

const Nursery = mongoose.model("Nursery", nurserySchema);
export default Nursery;
