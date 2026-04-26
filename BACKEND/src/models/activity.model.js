import mongoose from "mongoose"

const schema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    viewedProducts : [String],
    searches : [String],
    cartItems : [String]
}, { timestamps : true })

const activityModel = mongoose.model("Activity", schema)

export default activityModel