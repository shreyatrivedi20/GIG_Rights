import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const workerSchema = new Schema(
    {
        phone: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        lang: {
            type: String,
            enum: ["en", "hi"],
            default: "en"
        },
        theme: {
            type: String,
            enum: ["dark", "light"],
            default: "dark"
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
)

// No password/pre-save hashing hook here —
// Worker auth is OTP-based, not password-based (unlike User)

// methods created by using "methods" function

workerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phone: this.phone,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

workerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Worker = mongoose.model("Worker", workerSchema)