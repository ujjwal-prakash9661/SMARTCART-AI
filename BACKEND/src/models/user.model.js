import mongoose from "mongoose"

const schema = new mongoose.Schema({
    name : String,
    email : {
        type : String,
        unique : true
    },
    password : String,
    avatar : String,
    phone : String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    addresses: [{
        type: { type: String }, // 'HOME', 'OFFICE', 'OTHER'
        text: String,
        isDefault: { type: Boolean, default: false }
    }],
    paymentMethods: [{
        type: { type: String }, // 'CARD', 'UPI'
        cardType: String,
        last4: String,
        expiry: String,
        upiId: String,
        isDefault: { type: Boolean, default: false }
    }],
    settings: {
        notifications: {
            orderUpdates: { type: Boolean, default: true },
            promotions: { type: Boolean, default: false },
            securityAlerts: { type: Boolean, default: true }
        },
        twoFactorAuth: { type: Boolean, default: false },
        themeColors: {
            navbar: { type: String, default: '#00FFCC' },
            store: { type: String, default: '#00FFCC' },
            profile: { type: String, default: '#00FFCC' },
            cart: { type: String, default: '#00FFCC' },
            orders: { type: String, default: '#00FFCC' },
            admin: { type: String, default: '#00FFCC' }
        }
    }
}, {timestamps : true})

const userModel = mongoose.model("User", schema)

export default userModel
