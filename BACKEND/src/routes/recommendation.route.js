import express from "express"
import {getRecommendations} from '../controllers/recommendation.controller.js'
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router()

router.get("/", authMiddleware, getRecommendations)

export default router