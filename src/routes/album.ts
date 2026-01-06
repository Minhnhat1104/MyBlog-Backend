import express from "express";
import { albumController } from "@/controllers/albumController.ts";
import middlewareController from "@/controllers/middlewareController.ts";
import { upload } from "@/tools/image";

const router = express.Router();

// router.get("/", middlewareController.verifyToken, imageController.getAllImage);
router.get("/list", albumController.getAlbums);
router.get("/create", upload.array("photos"), albumController.createAlbum);
router.get("/delete", albumController.deleteAlbum);

export default router;
