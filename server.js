require('dotenv').config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit process if DB fails
  }
};

startServer();
