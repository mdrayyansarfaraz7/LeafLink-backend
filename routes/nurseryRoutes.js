import express from "express";
import { getNurseryDetails, getNurseryOverview } from "../controllers/nurseryController.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/:id", verifyUser, getNurseryDetails);
router.get("/:id/overview", verifyUser, getNurseryOverview);

export default router;
