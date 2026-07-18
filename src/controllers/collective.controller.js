import { asyncHandler } from "../utils/asyncHandler.js"
import { Shift } from "../models/shift.model.js"
import { Anomaly } from "../models/anomaly.model.js"
import { Worker } from "../models/worker.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getLeaderboard = asyncHandler(async (req, res) => {
    const { platform, city } = req.query

    // build match stage dynamically based on filters
    const matchStage = {}

    // aggregate shifts, joined with worker info (for city), grouped by city+platform
    const leaderboard = await Shift.aggregate([
        {
            $lookup: {
                from: "workers",
                localField: "worker",
                foreignField: "_id",
                as: "workerInfo"
            }
        },
        {
            $unwind: "$workerInfo"
        },
        {
            $match: {
                ...(platform && platform !== "All" && { platform }),
                ...(city && city !== "All" && { "workerInfo.city": city })
            }
        },
        {
            $group: {
                _id: {
                    city: "$workerInfo.city",
                    platform: "$platform"
                },
                worker_count: { $addToSet: "$worker" },
                avg_earnings: { $avg: "$earnings" }
            }
        },
        {
            $project: {
                _id: 0,
                city: "$_id.city",
                platform: "$_id.platform",
                worker_count: { $size: "$worker_count" },
                avg_earnings: { $round: ["$avg_earnings", 0] }
            }
        },
        {
            $sort: { avg_earnings: -1 }
        }
    ])

    // overall stats
    const totalWorkers = await Worker.countDocuments()
    const totalShifts = await Shift.countDocuments()
    const earningsAgg = await Shift.aggregate([
        { $group: { _id: null, total: { $sum: "$earnings" } } }
    ])
    const totalEarnings = earningsAgg[0]?.total || 0

    const stats = {
        total_workers: totalWorkers,
        total_shifts: totalShifts,
        total_earnings: totalEarnings
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { leaderboard, stats }, "Leaderboard fetched successfully"))
})

const getPatterns = asyncHandler(async (req, res) => {
    const patterns = await Anomaly.aggregate([
        {
            $group: {
                _id: "$title",
                worker_count: { $addToSet: "$worker" }
            }
        },
        {
            $project: {
                _id: 0,
                title: "$_id",
                worker_count: { $size: "$worker_count" }
            }
        },
        {
            $match: {
                worker_count: { $gte: 2 } // only show patterns affecting 2+ workers
            }
        },
        {
            $sort: { worker_count: -1 }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, {
            pattern_detected: patterns.length > 0,
            patterns
        }, "Patterns fetched successfully"))
})

export { getLeaderboard, getPatterns }