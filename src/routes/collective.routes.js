import { Router } from "express";
import { getLeaderboard, getPatterns } from "../controllers/collective.controller.js";

const router = Router()

router.route("/leaderboard").get(getLeaderboard)
router.route("/patterns").get(getPatterns)

export default router