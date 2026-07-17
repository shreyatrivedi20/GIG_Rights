import { Router } from "express";
import { getAnomalies, uploadEvidence } from "../controllers/anomaly.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/").get(verifyJWT, getAnomalies)
router.route("/:anomalyId/evidence").post(verifyJWT, upload.single("evidence"), uploadEvidence)

export default router