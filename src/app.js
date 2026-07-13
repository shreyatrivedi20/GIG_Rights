import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

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

export{ app }    