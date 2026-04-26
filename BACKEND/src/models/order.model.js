import mongoose from "mongoose"

const schema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    products : Array,
    totalPrice : Number,
    status : {
        type : String,
        default : "Order Placed"
    },

    location : {
        type : String,
        default : "Address Not Provided"
    },
    paymentMethod: {
        type: String,
        default: "Razorpay Gateway"
    },
    paymentStatus: {
        type: String,
        default: "PAID & CONFIRMED"
    }
}, { timestamps : true });

const orderModel = mongoose.model("Order", schema)

export default orderModel