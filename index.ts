import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { default as authRouter } from "./src/routes/auth";
import { default as imageRouter } from "./src/routes/image";
// Import the functions you need from the SDKs you need

dotenv.config();
const app = express();

app.use(express.static("public"));

// console.log(
//   "🚀 ~ file: index.ts:19 ~ process.env.CONNECTION_STRING:",
//   process.env
// );
const connectDB = async () => {
  await mongoose.connect(process.env.CONNECTION_STRING || "", () => {
    console.log("Connected to database!");
  });
};
connectDB();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//routes
app.use("/v1/auth", authRouter);
app.use("/v1/image", imageRouter);

const port = process.env.PORT || 8000;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server is running at ${port}`);
  }
});
