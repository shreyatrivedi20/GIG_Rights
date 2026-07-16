import { asyncHandler } from "../utils/asyncHandler.js"
import { Worker } from "../models/worker.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getCurrentWorker = asyncHandler(async (req, res) => {
    // req.worker was already attached by verifyJWT middleware —
    // no need to query the database again here
    return res
        .status(200)
        .json(new ApiResponse(200, req.worker, "Current worker fetched successfully"))
})

const updateWorkerProfile = asyncHandler(async (req, res) => {
    const { name, city, lang, theme } = req.body

    if (!name && !city && !lang && !theme) {
        throw new ApiError(400, "At least one field is required to update")
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
        req.worker?._id,
        {
            $set: {
                ...(name && { name }),
                ...(city && { city }),
                ...(lang && { lang }),
                ...(theme && { theme })
            }
        },
        { new: true }
    ).select("-refreshToken")

    if (!updatedWorker) {
        throw new ApiError(404, "Worker not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedWorker, "Profile updated successfully"))
})

export { getCurrentWorker, updateWorkerProfile }