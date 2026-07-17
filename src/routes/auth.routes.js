import { Router } from "express";
import { logoutWorker, sendOtp, verifyOtp } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/send-otp").post(sendOtp)
router.route("/verify-otp").post(verifyOtp)
router.route("/logout").post(verifyJWT , logoutWorker)

export default router