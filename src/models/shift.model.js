import mongoose, { Schema } from "mongoose";

const shiftSchema = new Schema(
    {
        worker: {
            type: Schema.Types.ObjectId,
            ref: "Worker",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        platform: {
            type: String,
            enum: ["Swiggy", "Zomato", "Urban Company", "Blinkit", "Dunzo"],
            required: true
        },
        earnings: {
            type: Number,
            required: true
        },
        orders: {
            type: Number,
            default: 0
        },
        hours: {
            type: Number,
            default: 0
        },
        notes: {
            type: String,
            trim: true
        },
        synced: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

export const Shift = mongoose.model("Shift", shiftSchema)