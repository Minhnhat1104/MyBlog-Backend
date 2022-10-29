import express from "express";
import imageController from "../controllers/imageController.js";
import middlewareController from "../controllers/middlewareController.js";

const router = express.Router();

router.get("/", middlewareController.verifyToken, imageController.getAllImage);

router.get(
  "/:id",
  middlewareController.verifyToken,
  imageController.getImageById
);

router.patch(
  "/update/:id",
  middlewareController.verifyToken,
  imageController.updateImage
);
router.post(
  "/upload",
  middlewareController.verifyToken,
  imageController.uploadImage
);
router.delete(
  "/delete/:id",
  middlewareController.verifyToken,
  imageController.deleteImage
);

export default router;
