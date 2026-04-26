import express from "express"
import passport from "passport"
import {registerUser, loginUser, getMe, updateProfile, sendOTP, verifyOTP, phoneLogin, getWishlist, toggleWishlist } from '../controllers/auth.controller.js'
import generateToken from '../utils/generateToken.js'
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", authMiddleware, getMe)
router.put("/update", authMiddleware, updateProfile)
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)
router.post("/phone-login", phoneLogin)
router.get("/wishlist", authMiddleware, getWishlist)
router.post("/wishlist/:productId", authMiddleware, toggleWishlist)

router.get("/google", passport.authenticate("google", { scope : ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", { session : false}), (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/auth?token=${token}`);
})

export default router