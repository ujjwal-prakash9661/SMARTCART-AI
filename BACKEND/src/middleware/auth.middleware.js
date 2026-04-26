import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const authMiddleware = async(req, res, next) => {
    try
    {
        const token = req.headers.authorization?.split(" ")[1]

        if(!token)
        {
            return res.status(401).json({
                message : "No token Provided"
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decode.id).select("-password")

        if(!user)
        {
            return res.status(401).json({
                message : "User Not Found"
            })
        }

        req.user = user

        next()
    }

    catch(err)
    {
        res.status(401).json({ message: "Invalid token" })
    }
}

export const optionalAuthMiddleware = async(req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        
        if (!token) return next()

        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decode.id).select("-password")
        
        if (user) req.user = user
        next()
    } catch (err) {
        // Proceed without attaching user if token is invalid
        next()
    }
}

export default authMiddleware