import { Router } from "express";
import { createShift, getShifts, getEarningsSummary } from "../controllers/shift.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/").post(verifyJWT, createShift)
router.route("/").get(verifyJWT, getShifts)
router.route("/summary").get(verifyJWT, getEarningsSummary)

export default router