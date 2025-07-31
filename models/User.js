import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
    mail:{type: String, required: true},
    passwordHash:{type: String, required: true},
    nickName:{type: String, required: false}
})

export default mongoose.model('notes',notesSchema)