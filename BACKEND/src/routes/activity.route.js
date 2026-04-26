import express from "express"
import {trackView} from "../controllers/activity.controller.js"
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/view", authMiddleware, trackView)

export default router