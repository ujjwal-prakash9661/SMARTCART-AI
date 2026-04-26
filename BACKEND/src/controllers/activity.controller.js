import Activity from '../models/activity.model.js'

export const trackView = async(req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    let activity = await Activity.findOne({ user : userId})
    
    if(!activity)
    {
        activity = await Activity.create({
            user : userId,
            viewedProducts : [productId]
        })
    }

    else
    {
        if(!activity.viewedProducts.includes(productId))
        {
            activity.viewedProducts.push(productId)
        }
        await activity.save()
    }

    res.json({
        message : "Activity Tracked"
    })
}