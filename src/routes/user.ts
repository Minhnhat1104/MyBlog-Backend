import express from "express";
import authMiddleware from "@/middlewares/authMiddleware";
import { avatarUpload } from "@/tools/image";
import userController from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/avatar", userController.getAvatar); // img tag cannot add accessToken to request header
userRouter.post(
  "/avatar",
  authMiddleware.verifyToken,
  avatarUpload.single("photo"),
  userController.updateAvatar,
);
userRouter.post(
  "/profile",
  authMiddleware.verifyToken,
  userController.updateProfile,
);
userRouter.post(
  "/change-password",
  authMiddleware.verifyToken,
  userController.changePassword,
);

export default userRouter;
