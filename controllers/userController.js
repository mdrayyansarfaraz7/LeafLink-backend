import User from "../models/User.js";

// 1. Get all cashiers under manager's nursery
export const getCashiers = async (req, res) => {
  try {
    const managerNurseryId = req.user.nursery;
    const cashiers = await User.find({ nursery: managerNurseryId, role: "cashier" }).select("-password");
    res.json(cashiers);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch cashiers", error });
  }
};

// 2. Get single user by ID (manager can see only users in their nursery)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (req.user.role === "manager" && String(user.nursery) !== String(req.user.nursery)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch user", error });
  }
};

// 3. Toggle cashier active status
export const toggleCashierStatus = async (req, res) => {
  try {
    const cashier = await User.findById(req.params.id);
    if (!cashier || cashier.role !== "cashier") {
      return res.status(404).json({ msg: "Cashier not found" });
    }
    if (String(cashier.nursery) !== String(req.user.nursery)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    cashier.isActive = !cashier.isActive;
    await cashier.save();
    res.json({ msg: `Cashier ${cashier.isActive ? "activated" : "deactivated"}`, cashier });
  } catch (error) {
    res.status(500).json({ msg: "Failed to toggle cashier status", error });
  }
};

// 4. Optional: Get own profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch profile", error });
  }
};
