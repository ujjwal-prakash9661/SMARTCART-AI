import express from "express"
import { smartAI } from "../controllers/ai.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", authMiddleware, smartAI)

export default router