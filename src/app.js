const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const bookingRouter = require("./routes/booking.routes");
const authRouter = require("./routes/auth.routes");
const app = express();

// 1. Middlewares
app.use(express.json());



// 2. Routes Mount karna
app.use("/auth",authRouter);
app.use("/booking",bookingRouter)

// 3. Health Check Route (Optional but good)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", msg: "Server is healthy" });
});

module.exports = app;
app.use(errorHandler);