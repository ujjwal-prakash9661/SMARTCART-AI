import express from "express"
import {createProduct, getProducts, getSingleProduct, rateProduct, getSuggestions, bulkCreateProducts, getCategories} from "../controllers/product.controller.js"
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router()

router.post("/", authMiddleware, adminMiddleware, createProduct);
router.post("/bulk", authMiddleware, adminMiddleware, bulkCreateProducts);
router.get("/categories", getCategories);
router.get("/suggestions", getSuggestions);
router.get("/", optionalAuthMiddleware, getProducts);
router.get("/:id", optionalAuthMiddleware, getSingleProduct)
router.post("/:id/reviews", authMiddleware, rateProduct)

export default router