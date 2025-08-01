import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    mail:{type: String, required: true},
    passwordHash:{type: String, required: true},
    nickName:{type: String, required: true}
})

export default mongoose.model('user',userSchema)