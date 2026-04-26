import express from "express";
import { placeOrder, trackOrder, getMyOrders } from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, placeOrder);
router.get("/myorders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, trackOrder);

export default router;