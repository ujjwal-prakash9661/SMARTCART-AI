import express from "express"
import cors from "cors"
import session from "express-session"
import passport from "./config/passport.js"

import authRoutes from "./routes/auth.route.js"
import productRoutes from './routes/product.route.js'
import orderRoutes from './routes/order.route.js'
import activityRoutes from './routes/activity.route.js'

import recommendationRoutes from "./routes/recommendation.route.js"

import chatRoutes from "./routes/chat.route.js"

import aiRoutes from "./routes/ai.route.js"

import adminRoutes from "./routes/admin.route.js"
import paymentRoutes from "./routes/payment.route.js"

const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cors())

app.use(session({
    secret : "secret",
    resave : false,
    saveUninitialized : true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

app.use("/api/activity", activityRoutes)

app.use("/api/recommend", recommendationRoutes)

app.use("/api/chat", chatRoutes)

app.use("/api/ai", aiRoutes)

app.use("/api/admin", adminRoutes)
app.use("/api/payment", paymentRoutes)

export default app;