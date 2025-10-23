import express from "express";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import nurseryRoutes from "./routes/nurseryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";



dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Connect to MongoDB
connectDB();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/nurseries", nurseryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/analytics", analyticsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("LeafLink Backend is running");
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
