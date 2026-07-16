import { Router } from "express";
import { getCurrentWorker, updateWorkerProfile } from "../controllers/worker.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/profile").get(verifyJWT, getCurrentWorker)
router.route("/profile").patch(verifyJWT, updateWorkerProfile)

export default router