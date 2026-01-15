import express from "express";
import authController from "@/controllers/authController.ts";
import authMiddleware from "@/middlewares/authMiddleware";

const router = express.Router();
router.get("/test", authController.testPing);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh", authController.requestRefreshToken);
router.post("/forgot-password", authController.sendResetPasswordEmail);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/logout",
  authMiddleware.verifyToken,
  authController.logoutUser
);

export default router;
