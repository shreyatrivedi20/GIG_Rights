import dotenv from "dotenv"
dotenv.config({ path: './.env' })


import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import authRouter from "./routes/auth.routes.js"
import workerRouter from "./routes/worker.routes.js"
import shiftRouter from "./routes/shift.routes.js"
import anomalyRouter from "./routes/anomaly.routes.js"
import collectiveRouter from "./routes/collective.routes.js"


const app = express()
console.log("CORS_ORIGIN is set to:", process.env.CORS_ORIGIN)

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//to accept data from "FORMS"
app.use(express.json({
    limit:"16kb"
}))

//to accept data from "URLs"
app.use(express.urlencoded({extended:true , limit:"16kb"}))

//to store the coming images or favicon or etc
app.use(express.static("public"))

// to access user's browser cokkies ans set them i.e  perform CRUD operations
app.use(cookieParser())


app.use("/api/v1/auth", authRouter)

app.use("/api/v1/workers", workerRouter)

app.use("/api/v1/shifts", shiftRouter)

app.use("/api/v1/anomalies", anomalyRouter)

app.use("/api/v1/collective", collectiveRouter)

//for testing whetherjwt is working fine or not


import { verifyJWT } from "./middlewares/auth.middleware.js"

app.get("/api/v1/test-protected", verifyJWT, (req, res) => {
    res.status(200).json({ message: "You are logged in!", worker: req.worker })
})

export{ app }    