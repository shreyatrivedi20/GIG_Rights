import { asyncHandler } from "../utils/asyncHandler.js"
import { Anomaly } from "../models/anomaly.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAnomalies = asyncHandler(async (req, res) => {
    const anomalies = await Anomaly.find({ worker: req.worker._id }).sort({ date: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, anomalies, "Anomalies fetched successfully"))
})

const uploadEvidence = asyncHandler(async (req, res) => {
    const { anomalyId } = req.params

    const evidenceLocalPath = req.file?.path

    if (!evidenceLocalPath) {
        throw new ApiError(400, "Evidence file is required")
    }

    const anomaly = await Anomaly.findOne({ _id: anomalyId, worker: req.worker._id })

    if (!anomaly) {
        throw new ApiError(404, "Anomaly not found")
    }

    const evidence = await uploadOnCloudinary(evidenceLocalPath)

    if (!evidence) {
        throw new ApiError(500, "Something went wrong while uploading evidence")
    }

    anomaly.evidenceUrl = evidence.url
    await anomaly.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, anomaly, "Evidence uploaded successfully"))
})

export { getAnomalies, uploadEvidence }