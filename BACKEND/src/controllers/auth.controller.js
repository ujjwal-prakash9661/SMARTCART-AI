import User from "../models/user.model.js"
import bcrypt, { hash } from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    const {name, email, password} = req.body

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password : hashed
    });

    res.json({
        user,
        token : generateToken(user._id)
    })
};

export const loginUser = async(req, res) => {
    const {email, password} = req.body

    const user = await User.findOne({ email })

    if(!user) return res.status(400).json({
        message : "User with this email doesn't exist"
    })

    const match = await bcrypt.compare(password, user.password)

    if(!match) return res.status(400).json({
        message : "Password didn't match"
    })

    res.json({
        user,
        token : generateToken(user._id)
    })
}

export const getMe = async (req, res) => {
    res.json(req.user);
}

import { sendSMS } from "../utils/sms.js";

// Temporary storage for OTPs (In production, use Redis or a DB)
const otps = new Map();

export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: "Phone number is required" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otps.set(phone, otp);

        await sendSMS(phone, `Your SmartCart AI verification code is: ${otp}`);
        
        res.json({ 
            message: "OTP sent successfully",
            otp: otp // Returning OTP for testing; remove in production
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const savedOtp = otps.get(phone);

        if (savedOtp === otp) {
            otps.delete(phone); // Clear OTP after success

            let user = await User.findOne({ phone });
            if (!user) {
                // Auto-register if user doesn't exist
                user = await User.create({
                    phone,
                    name: `User ${phone.slice(-4)}`,
                    email: `${phone}@smartcart.com`, // Placeholder
                    password: "otp-login"
                });
            }

            res.json({
                user,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification failed" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email, avatar, phone, addresses, paymentMethods, settings, password } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (phone !== undefined) updateData.phone = phone;
        if (addresses !== undefined) updateData.addresses = addresses;
        if (paymentMethods !== undefined) updateData.paymentMethods = paymentMethods;
        if (settings !== undefined) updateData.settings = settings;

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updateData.password = hashed;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { returnDocument: 'after' }
        ).select("-password");

        res.json(user);
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: error.message || "Failed to update profile" });
    }
}

import admin from "../config/firebaseAdmin.js";

export const phoneLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { phone_number } = decodedToken;

        if (!phone_number) {
            return res.status(400).json({ message: "Phone number not found in token" });
        }

        let user = await User.findOne({ phone: phone_number });
        if (!user) {
            user = await User.create({
                phone: phone_number,
                name: `User ${phone_number.slice(-4)}`,
                email: `${phone_number.replace('+', '')}@smartcart.com`,
                password: "firebase-login"
            });
        }

        res.json({
            message: "Login success",
            user,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Firebase Login Error:", error);
        res.status(500).json({ message: error.message || "Firebase login failed" });
    }
};

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const index = user.wishlist.findIndex(id => id.toString() === productId);
        if (index === -1) {
            // Add to wishlist
            user.wishlist.push(productId);
        } else {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
        }

        await user.save();
        
        // Populate the wishlist items to return full product details
        const populatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json(populatedUser.wishlist);
    } catch (error) {
        console.error("Toggle Wishlist Error:", error);
        res.status(500).json({ message: error.message || "Failed to update wishlist" });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.wishlist || []);
    } catch (error) {
        console.error("Get Wishlist Error:", error);
        res.status(500).json({ message: error.message || "Failed to get wishlist" });
    }
};