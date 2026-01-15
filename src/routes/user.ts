import express from "express";
import middlewareController from "@/middlewares/middlewareController";
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
userRouter.post(
  "/change-password",
  middlewareController.verifyToken,
  userController.changePassword
);

export default userRouter;
