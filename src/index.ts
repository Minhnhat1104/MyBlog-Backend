import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "@/routes/auth";
import imageRouter from "@/routes/image";
// Import the functions you need from the SDKs you need
import "dotenv/config";
import { prismaConnectDB } from "./config/prisma.config";
import albumRouter from "./routes/album";
import userRouter from "./routes/user";
import { i18nMiddleware } from "./middlewares/i18nMiddleware";
import { Request, Response, NextFunction } from "express";
import { logger } from "./tools/logger";

dotenv.config();
const app = express();

app.use(express.static("public"));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://drive.ravosoft.com"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(i18nMiddleware);

//routes
app.use("/v1/auth", authRouter);
app.use("/v1/user", userRouter);
app.use("/v1/image", imageRouter);
app.use("/v1/album", albumRouter);

// Error handler (use func with 4 params)
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  logger.error("Internal error", err);
  res.status(500).json({ message: "Internal Server Error" });
});

async function startServer() {
  try {
    // Connect to MySQL database
    const connectSuccess = prismaConnectDB();
    const hasEnv = !!process.env.MYSQL_PASSWORD;
    console.log(hasEnv ? "Has env" : "Not found env");

    if (!connectSuccess) {
      throw new Error("Database connect failed!");
    }
    console.log("Connected to MySQL successfully");

    // Start the Express server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `API documentation available at http://localhost:${PORT}/api-docs`
      );
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
  // closeDatabaseConnection();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Shutting down...");
  // closeDatabaseConnection();
  process.exit(0);
});

// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
  startServer();
}
