import express from "express";
import imageController from "@/controllers/imageController.ts";
import authMiddleware from "@/middlewares/authMiddleware";
import { upload } from "@/tools/image";

const router = express.Router();

router.get("/", authMiddleware.verifyToken, imageController.getAllImage);
router.get("/file/:id", imageController.getStatisImage);

router.get(
  "/:id",
  authMiddleware.verifyToken,
  imageController.getImageById
);

router.patch(
  "/update/:id",
  authMiddleware.verifyToken,
  imageController.updateImage
);
router.post(
  "/upload",
  authMiddleware.verifyToken,
  upload.single("imageFile"),
  imageController.uploadImage
);
router.delete(
  "/delete/:id",
  authMiddleware.verifyToken,
  imageController.deleteImage
);

router.post(
  "/favorite",
  authMiddleware.verifyToken,
  imageController.setFavoriteImage
);

router.post(
  "/edit",
  authMiddleware.verifyToken,
  upload.single("photo"),
  imageController.setEditImage
);

router.post(
  "/reset",
  authMiddleware.verifyToken,
  imageController.resetToOriginImage
);

export default router;
