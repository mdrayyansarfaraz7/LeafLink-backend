import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ------------------- VERIFY USER -------------------
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to req
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

export const isManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ msg: "Access denied, manager only" });
  }
  next();
};

export const isCashier = (req, res, next) => {
  console.log("User:", req.user);
  if (req.user.role !== "cashier") {
    return res.status(403).json({ msg: "Access denied, cashier only" });
  }
  next();
};
