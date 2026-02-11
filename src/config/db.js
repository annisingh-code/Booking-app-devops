const mongoose = require("mongoose");
require("dotenv").config(); // Ensure .env is loaded

const connectDB = async () => {
    try {
        // Mongoose connection logic
        const conn = await mongoose.connect(process.env.DATABASE_URL);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);

        // Agar DB connect nahi hua to server chalane ka koi fayda nahi
        process.exit(1);
    }
};

module.exports = connectDB;