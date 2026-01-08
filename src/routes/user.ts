import express from "express";
import middlewareController from "@/controllers/middlewareController.ts";
import { upload } from "@/tools/image";
import userController from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/avatar", userController.getAvatar);
userRouter.post("/avatar", upload.single("photo"), userController.updateAvatar);
userRouter.post("/profile", userController.updateProfile);

export default userRouter;
