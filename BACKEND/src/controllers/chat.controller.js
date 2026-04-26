import Product from '../models/product.model.js'

export const chatWithAI = async(req, res) => {
    try
    {
        const { message } = req.body

        let category = null
        let maxPrice = null

        const lowerMsg = message.toLowerCase()

        if(lowerMsg.includes("watch")) category = "watch"
        if(lowerMsg.includes("laptop")) category = "laptop"
        if(lowerMsg.includes("bike")) category = "bike"

        const priceMatch = lowerMsg.match(/\d+/)
        if(priceMatch)
        {
            maxPrice = parseInt(priceMatch[0])
        }

        let query = {}

        if(category) query.category = category
        if(maxPrice) query.price = { $lte : maxPrice }

        const products = await Product.find(query).limit(5)

        res.json({
            message : "Here are some of the products you may like",
            filters : { category, maxPrice },
            products
        })
    }

    catch(err)
    {
        res.status(500).json({ message: err.message })
    }
}