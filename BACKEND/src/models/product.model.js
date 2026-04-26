import mongoose from "mongoose"

const schema = new mongoose.Schema({
    title : String,
    price : Number,
    description : String,
    image : String,
    category : String,
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
}, { timestamps : true })

const productModel = mongoose.model("Product", schema)

export default productModel