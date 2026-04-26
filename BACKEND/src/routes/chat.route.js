import express from "express"
import authMiddleware from "../middleware/auth.middleware.js"
import { chatWithAI } from "../controllers/chat.controller.js"

const router = express.Router()

router.post("/", authMiddleware, chatWithAI)

export default router