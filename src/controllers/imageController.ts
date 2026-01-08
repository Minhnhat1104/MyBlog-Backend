import { Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { Image } from "generated/prisma/client";
import { getImageSize } from "@/tools/image";
import path from "path";
import { errorToString } from "@/tools/error";
import fs from "fs";
const imageController = {
  uploadImage: async (req: Request, res: Response) => {
    try {
      const ext = path.extname(req?.file?.originalname || "");
      const creator_id = parseInt(req?.body?.creator_id);
      if (!req?.file?.path || !fs.existsSync(req?.file?.path || "")) {
        throw new Error("File not found.");
      }
      if (!creator_id) {
        throw new Error("Missing creator_id.");
      }
      const { width, height } = await getImageSize(req?.file?.path);

      const result = await prisma?.image.create({
        data: {
          ext,
          width: width || 0,
          height: height || 0,
          path: req?.file?.path || "",
          name: req?.body?.name,
          creator_id: creator_id,
        },
      });

      if (result) {
        return res
          .status(200)
          .json({ msg: "Post image successfully!", data: result });
      }
    } catch (error) {
      return res.status(400).json({ msg: errorToString(error) });
    }
  },

  getAllImage: async (req: Request, res: Response) => {
    try {
      const size = Number(req.query.size);
      const page = Number(req.query.page);
      const userId = Number(req?.user?.id);
      const my = req?.body?.my;

      if (!size || !page || !userId) {
        throw new Error("Invalid params!");
      }

      const images =
        (await prisma?.image.findMany({
          skip: size * (page - 1),
          take: size,
          where: {
            creator_id: my ? userId : undefined,
          },
          orderBy: {
            created_at: "desc",
          },
          omit: {
            creator_id: true,
          },
          include: {
            creator: true,
            tags: true,
            favorite_users: {
              where: {
                user_id: userId, // user đang login
              },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        })) || [];

      if (!images) {
        throw new Error("Get images failed!");
      }

      const mappedImages = images.map((image) => ({
        ...image,
        favorite: image.favorite_users.length > 0,
        favorite_users: undefined, // optional: xoá cho sạch response
      }));

      res.status(200).json({ rows: mappedImages });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
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
      res.status(400).json({ msg: errorToString(err) });
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
      res.status(400).json({ msg: errorToString(err) });
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
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  getStatisImage: async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req?.params?.id || "");
      if (!imageId) {
        throw new Error("Id not found!");
      }

      const image = await prisma?.image.findUnique({
        where: {
          id: imageId,
        },
      });

      if (!image) {
        throw new Error("Image not found!");
      }

      if (!fs.existsSync(image?.path)) {
        throw new Error("Image file is not existed!");
      }

      res.sendFile(image?.path);
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  setFavoriteImage: async (req: Request, res: Response) => {
    try {
      const userId = Number(req?.user?.id);
      const imageId = Number(req.body.imageId);
      const favorite = Number(req.body.favorite);

      if (!userId || !imageId) {
        throw new Error("Invalid params");
      }

      if (favorite) {
        const result = await prisma?.user_Image_Favotire.create({
          data: {
            user_id: userId,
            image_id: imageId,
          },
        });

        if (!result) {
          throw new Error("Set favorite image error");
        }

        return res.status(200).json({ rows: result, msg: "Successfully! 11" });
      } else {
        const result = await prisma?.user_Image_Favotire.deleteMany({
          where: {
            user_id: userId,
            image_id: imageId,
          },
        });

        if (!result) {
          throw new Error("Set favorite image error");
        }

        return res.status(200).json({ rows: result, msg: "Successfully!" });
      }
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },
};

export default imageController;
