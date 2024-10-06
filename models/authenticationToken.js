import mongoose, { mongo } from "mongoose";

const authenticateTokenSchema=mongoose.Schema({
    userId:{type:String},
    authToken:{type:String}
})

export const authToken=mongoose.model('authToken',authenticateTokenSchema)