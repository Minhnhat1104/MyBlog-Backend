import express from "express";
import { albumController } from "@/controllers/albumController.ts";
import middlewareController from "@/middlewares/middlewareController";
import { upload } from "@/tools/image";

const albumRouter = express.Router();

albumRouter.get("/list", albumController.getAlbums);
albumRouter.post(
  "/create",
  upload.array("photos"),
  middlewareController.verifyToken,
  albumController.createAlbum
);
albumRouter.post(
  "/delete",
  middlewareController.verifyToken,
  albumController.deleteAlbum
);

export default albumRouter;
