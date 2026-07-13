import mongoose, { Schema } from "mongoose";

const anomalySchema = new Schema(
    {
        worker: {
            type: Schema.Types.ObjectId,
            ref: "Worker",
            required: true
        },
        shift: {
            type: Schema.Types.ObjectId,
            ref: "Shift"
        },
        date: {
            type: Date,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ["high", "medium"],
            required: true
        },
        expected: {
            type: Number,
            required: true
        },
        actual: {
            type: Number,
            required: true
        },
        gap: {
            type: Number,
            required: true
        },
        evidenceUrl: {
            type: String  // cloudinary url
        }
    },
    { timestamps: true }
)

export const Anomaly = mongoose.model("Anomaly", anomalySchema)