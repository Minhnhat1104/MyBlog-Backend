import express from "express";
import { albumController } from "@/controllers/albumController.ts";
import authMiddleware from "@/middlewares/authMiddleware";
import { upload } from "@/tools/image";

const albumRouter = express.Router();

albumRouter.get("/list", albumController.getAlbums);
albumRouter.post(
  "/create",
  upload.array("photos"),
  authMiddleware.verifyToken,
  albumController.createAlbum
);
albumRouter.post(
  "/delete",
  authMiddleware.verifyToken,
  albumController.deleteAlbum
);

export default albumRouter;
