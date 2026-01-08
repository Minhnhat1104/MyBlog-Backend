import express from "express";
import middlewareController from "@/controllers/middlewareController.ts";
import { upload } from "@/tools/image";
import userController from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/avatar", userController.getAvatar); // img tag cannot add accessToken to request header
userRouter.post(
  "/avatar",
  middlewareController.verifyToken,
  upload.single("photo"),
  userController.updateAvatar
);
userRouter.post(
  "/profile",
  middlewareController.verifyToken,
  userController.updateProfile
);

export default userRouter;
