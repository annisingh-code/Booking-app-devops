// 👇 YE LINE SABSE TOP PE HONI CHAHIYE
require("dotenv").config();

const express = require("express");
// Middleware imports
const errorHandler = require("./middleware/errorHandler"); 
// Route imports
const bookingRouter = require("./routes/booking.routes");
const authRouter = require("./routes/auth.routes");

const app = express();

// 1. Middlewares
app.use(express.json());

// 2. Routes Mount karna
// Best Practice: Hamesha '/api' prefix lagana chahiye versioning ke liye
app.use("/api/auth", authRouter);       // Ab route ban gaya: /api/auth/login
app.use("/api/booking", bookingRouter); // Ab route ban gaya: /api/booking/:id

// 3. Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", msg: "Server is healthy" });
});

// 4. Error Handler (Routes ke BAAD aur Export se PEHLE aana chahiye)
app.use(errorHandler);

// 5. Export (Sabse Last)
module.exports = app;