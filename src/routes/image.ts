import express from "express";
import imageController from "@/controllers/imageController.ts";
import middlewareController from "@/controllers/middlewareController.ts";
import { upload } from "@/tools/image";

const router = express.Router();

// router.get("/", middlewareController.verifyToken, imageController.getAllImage);
router.get("/", imageController.getAllImage);

router.get(
  "/:id",
  // middlewareController.verifyToken,
  imageController.getImageById
);

router.patch(
  "/update/:id",
  // middlewareController.verifyToken,
  imageController.updateImage
);
router.post(
  "/upload",
  // middlewareController.verifyToken,
  upload.single("imageFile"),
  imageController.uploadImage
);
router.delete(
  "/delete/:id",
  // middlewareController.verifyToken,
  imageController.deleteImage
);

export default router;
