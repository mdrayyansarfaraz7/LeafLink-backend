import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nursery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nursery",
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() { return this.isActive; }, 
      select: false,
    },
    role: {
      type: String,
      enum: ["manager", "cashier"],
      default: "cashier",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    inviteCode: String, 
    invitedAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
