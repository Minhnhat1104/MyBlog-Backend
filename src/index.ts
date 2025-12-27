import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { default as authRouter } from "@/routes/auth";
import { default as imageRouter } from "@/routes/image";
import { closeDatabaseConnection, connectToDatabase } from "./config/database";
// Import the functions you need from the SDKs you need

dotenv.config();
const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

//routes
app.use("/v1/auth", authRouter);
app.use("/v1/image", imageRouter);


async function startServer() {
  try {
    console.log("Starting MongoDB Sample MFlix API...");

    // Connect to MongoDB database
    console.log("Connecting to MongoDB...");
    await connectToDatabase();
    console.log("Connected to MongoDB successfully");

    // Start the Express server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    // Exit the process if we can't start properly
    // This ensures the application doesn't run in a broken state
    process.exit(1);
  }
}

/**
 * Graceful Shutdown Handler
 * Ensures the application shuts down cleanly when terminated
 */
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Shutting down...");
  closeDatabaseConnection();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Shutting down...");
  closeDatabaseConnection();
  process.exit(0);
});


// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
  startServer();
}
