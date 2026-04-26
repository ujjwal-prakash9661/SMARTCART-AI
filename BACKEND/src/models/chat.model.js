import mongoose from "mongoose"

const schema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    messages : [
        {
            role : String,
            content : String
        }
    ]
}, { timestamps : true })

const chatModel = mongoose.model("Chat", schema)

export default chatModel