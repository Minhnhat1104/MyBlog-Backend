import { Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { Image } from "generated/prisma/client";
import { getImageSize } from "@/tools/image";
import path from "path";

const imageController = {
  uploadImage: async (req: Request, res: Response) => {
    try {
      const ext = path.extname(req?.file?.originalname || "");
      if (!req?.file?.buffer) {
        throw new Error("File buffer now found.");
      }
      const { width, height } = await getImageSize(req?.file?.buffer);

      await prisma?.image.create({
        data: {
          ext,
          width: width || 0,
          height: height || 0,
          path: req?.file?.path,
          name: req?.body?.name,
          creator_id: req?.body?.creator_id,
        },
      });

      return res.status(200).json({ msg: "Post image successfully!" });
    } catch (error) {
      return res.status(500).json({ msg: error });
    }
  },

  getAllImage: async (req: Request, res: Response) => {
    try {
      let images: Image[] | null = [];
      if (req.query.size && req.query.page) {
        const size = Number(req.query.size);
        const page = Number(req.query.page);
        console.log("Paging: ", size, page);

        images =
          (await prisma?.image.findMany({
            skip: size * (page - 1),
            take: size,
            orderBy: {
              created_at: "desc",
            },
          })) || [];
      } else {
        images =
          (await prisma?.image.findMany({
            orderBy: {
              created_at: "desc",
            },
          })) || [];
      }
      res.status(200).json({ data: images });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },

  getImageById: async (req: Request, res: Response) => {
    try {
      const image = await prisma?.image.findUnique({
        where: {
          id: parseInt(req.params.id),
        },
      });
      res.status(200).json(image);
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },

  deleteImage: async (req: Request, res: Response) => {
    try {
      const result = await prisma?.image.delete({
        where: {
          id: parseInt(req.params.id),
        },
      });
      if (!result) {
        throw new Error("Image not found!");
      }
      res.status(200).json({ msg: "delete successfully" });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },

  updateImage: async (req: Request, res: Response) => {
    try {
      const result = await prisma?.image.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
          name: req.body.name,
          // description: req.body.description,
          creator_id: req.body.creator_id,
        },
      });

      if (!result) {
        throw new Error("Update failed");
      }

      res.status(200).json({ msg: "update successfully" });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
};

export default imageController;
