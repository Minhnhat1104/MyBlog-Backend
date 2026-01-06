import express from "express";
import { albumController } from "@/controllers/albumController.ts";
import middlewareController from "@/controllers/middlewareController.ts";
import { upload } from "@/tools/image";

const albumRouter = express.Router();

albumRouter.get("/list", albumController.getAlbums);
albumRouter.post(
  "/create",
  upload.array("photos"),
  albumController.createAlbum
);
albumRouter.post("/delete", albumController.deleteAlbum);

export default albumRouter;
