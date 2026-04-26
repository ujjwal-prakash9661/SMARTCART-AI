import mongoose from "mongoose"
import Activity from '../models/activity.model.js'
import Product from '../models/product.model.js'

export const getRecommendations = async(req, res) => {
    try
    {
        const userId = req.user.id

        const activity = await Activity.findOne({user : userId})

        if(!activity) return res.json({recommended : [], basedOn : []})

        const viewed = activity.viewedProducts

        const viewedObjectIDs = viewed.map(id => new mongoose.Types.ObjectId(id))

        const viewedProducts = await Product.find({
            _id : { $in : viewedObjectIDs}
        })

        const categories = viewedProducts.map(p => p.category?.toLowerCase()).filter(Boolean)

        const allProducts = await Product.find();

        const scoredProducts = allProducts.map(product => {
            let score = 0

            const productId = product._id.toString()
            const productCategory = product.category?.toLowerCase()

            if(categories.includes(productCategory))
            {
                score += 5
            }

            if(!viewed.includes(productId))
            {
                score += 3
            }

            const daysOld = 
                (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)
            
            if(daysOld < 7)
            {
                score += 2
            }

            return { product, score }
        })

        const recommendations = scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => item.product)

        res.json({
            recommended: recommendations,
            basedOn: viewedProducts
        })
    }

    catch(err)
    {
        console.log("Error in recommendation")
        res.status(500).json({message : "Internal Server Error"})
    }
}