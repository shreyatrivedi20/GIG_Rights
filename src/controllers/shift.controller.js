import { asyncHandler } from "../utils/asyncHandler.js"
import { Shift } from "../models/shift.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {Anomaly} from "../models/anomaly.model.js"

// fair-pay policy rates — same rates your frontend's mockApi.js uses
const PLATFORM_RATE_PER_ORDER = {
    Swiggy: 35,
    Zomato: 30,
    Blinkit: 25,
    Dunzo: 25
}
const URBAN_COMPANY_HOURLY_RATE = 150

const computeExpectedEarnings = (platform, orders, hours) => {
    if (platform === "Urban Company") {
        return Math.round((hours || 0) * URBAN_COMPANY_HOURLY_RATE)
    }
    const rate = PLATFORM_RATE_PER_ORDER[platform] ?? 28
    return Math.round((orders || 0) * rate)
}

const createShift = asyncHandler(async (req, res) => {
    const { date, platform, earnings, orders, hours, notes } = req.body

    if (!date || !platform || earnings === undefined) {
        throw new ApiError(400, "Date, platform, and earnings are required")
    }

    const shift = await Shift.create({
        worker: req.worker._id,
        date,
        platform,
        earnings,
        orders: orders || 0,
        hours: hours || 0,
        notes: notes || ""
    })

    if (!shift) {
        throw new ApiError(500, "Something went wrong while logging the shift")
    }

    // anomaly detection — check if this shift was underpaid
    const expected = computeExpectedEarnings(platform, orders, hours)
    const gap = expected - earnings
    let anomalyFlagged = false

    if (gap > 0 && expected > 0 && gap / expected > 0.15) {
        anomalyFlagged = true
        const metricLabel = platform === "Urban Company" ? `${hours} hours` : `${orders} orders`

        await Anomaly.create({
            worker: req.worker._id,
            shift: shift._id,
            date,
            title: `${platform} Pay Discrepancy`,
            description: `Expected ₹${expected} based on ${metricLabel} on ${date}, but received ₹${earnings}.`,
            severity: gap / expected > 0.3 ? "high" : "medium",
            expected,
            actual: earnings,
            gap
        })
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { shift, anomaly_flagged: anomalyFlagged }, "Shift logged successfully"))
})


const getShifts = asyncHandler(async (req, res) => {
    const shifts = await Shift.find({ worker: req.worker._id }).sort({ date: 1 })

    return res
        .status(200)
        .json(new ApiResponse(200, shifts, "Shifts fetched successfully"))
})

const getEarningsSummary = asyncHandler(async (req, res) => {
    const shifts = await Shift.find({ worker: req.worker._id }).sort({ date: 1 })

    const totalEarnings = shifts.reduce((acc, s) => acc + s.earnings, 0)
    const totalOrders = shifts.reduce((acc, s) => acc + (s.orders || 0), 0)
    const avgPerOrder = totalOrders > 0 ? Math.round(totalEarnings / totalOrders) : 0

    // simple linear regression for a "predicted" trend line,
    // same idea as the frontend's mock version
    const n = shifts.length
    let predictedSeries = []

    if (n > 0) {
        const xs = shifts.map((_, i) => i)
        const ys = shifts.map((s) => s.earnings)
        const xMean = xs.reduce((a, b) => a + b, 0) / n
        const yMean = ys.reduce((a, b) => a + b, 0) / n

        let num = 0
        let den = 0
        for (let i = 0; i < n; i++) {
            num += (xs[i] - xMean) * (ys[i] - yMean)
            den += (xs[i] - xMean) ** 2
        }

        const slope = den === 0 ? 0 : num / den
        const intercept = yMean - slope * xMean
        predictedSeries = xs.map((x) => Math.max(0, Math.round(slope * x + intercept)))
    }

    const trendData = shifts.map((s, i) => ({
        date: s.date,
        earnings: s.earnings,
        predicted: predictedSeries[i] ?? s.earnings
    }))

    const summary = {
        total_earnings: totalEarnings,
        avg_per_order: avgPerOrder,
        total_orders: totalOrders,
        trend_data: trendData
    }

    return res
        .status(200)
        .json(new ApiResponse(200, summary, "Earnings summary fetched successfully"))
})

export { createShift, getShifts, getEarningsSummary }