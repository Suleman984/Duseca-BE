import mongoose from "mongoose";
import jwt from "jsonwebtoken";
// import {  required } from "joi";
// import { array } from "joi";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    fname: { type: String, required: true },
    manager:{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { _id: this._id, role: this.role },  // Embed the user ID and role in the token
        process.env.JWTPRIVATEKEY,  // Secret key
        { expiresIn: "7d" }  // Token valid for 7 days
    );
    return token;
};

export const User = mongoose.model("User", userSchema);
