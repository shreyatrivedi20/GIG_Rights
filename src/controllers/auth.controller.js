import { asyncHandler } from "../utils/asyncHandler.js"
import { Worker } from "../models/worker.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const MOCK_OTP = "123456"

const generateAccessAndRefreshTokens = async (workerId) => {
    try {
        const worker = await Worker.findById(workerId)
        const accessToken = worker.generateAccessToken()
        const refreshToken = worker.generateRefreshToken()

        worker.refreshToken = refreshToken
        await worker.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const sendOtp = asyncHandler(async (req, res) => {
    // get phone from frontend
    const { phone } = req.body

    // validation -> not empty
    if (!phone || phone?.trim() === "") {
        throw new ApiError(400, "Phone number is required")
    }

    // mock-send OTP (no real SMS provider for v1)
    // frontend already tells the worker the mock OTP is 123456

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully")
    )
})

const verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body

    if (!phone || !otp) {
        throw new ApiError(400, "Phone and OTP are required")
    }

    if (otp !== MOCK_OTP) {
        throw new ApiError(401, "Invalid OTP")
    }

    // check if worker already exists : phone
    let worker = await Worker.findOne({ phone })

    // create worker if first-time login
    if (!worker) {
        worker = await Worker.create({
            phone,
            name: "Gig Worker",
            city: "Delhi",
            lang: "en",
            theme: "dark"
        })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(worker._id)

    // remove refreshToken field from response
    const loggedInWorker = await Worker.findById(worker._id).select("-refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { worker: loggedInWorker, accessToken, refreshToken },
                "Worker logged in successfully"
            )
        )
})

const logoutWorker = asyncHandler(async (req, res) => {
    await Worker.findByIdAndUpdate(
        req.worker._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Worker logged out successfully"))
})

export { sendOtp, verifyOtp , logoutWorker}