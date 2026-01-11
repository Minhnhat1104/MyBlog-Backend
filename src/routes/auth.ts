import express from "express";
import authController from "@/controllers/authController.ts";
import middlewareController from "@/controllers/middlewareController.ts";

const router = express.Router();
router.get("/test", authController.testPing);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh", authController.requestRefreshToken);
router.post("/forgot-password", authController.sendResetPasswordEmail);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logoutUser
);

export default router;
