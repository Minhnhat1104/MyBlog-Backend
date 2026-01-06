import { Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { Image } from "generated/prisma/client";
import { getImageSize } from "@/tools/image";
import path from "path";
import { errorToString } from "@/tools/error";
import fs from "fs";
import { ImageCreateWithoutAlbum_ofInput } from "generated/prisma/models";

export const albumController = {
  createAlbum: async (req: Request, res: Response) => {
    try {
      // req.files is array of `photos` files
      const { name, description } = req?.body;
      const creator_id = Number(req?.user?.id);
      if (!creator_id) {
        throw new Error("Missing creator_id.");
      }

      const images: ImageCreateWithoutAlbum_ofInput[] = [];
      if (Array.isArray(req.files)) {
        for (const _file of req.files) {
          if (!_file?.path || !fs.existsSync(_file?.path || "")) {
            throw new Error("File not found.");
          }

          const ext = path.extname(_file?.originalname || "");
          const { width, height } = await getImageSize(_file?.path);
          images.push({
            ext,
            width: width || 0,
            height: height || 0,
            path: _file?.path || "",
            name: req?.body?.name,
            creator: {
              connect: {
                id: creator_id,
              },
            },
          });
        }
      }

      const result = await prisma?.album.create({
        data: {
          name,
          description,
          creator_id: creator_id,
          images: {
            create: images,
          },
        },
      });

      if (!result) {
        throw new Error("Create album failed!");
      }

      return res
        .status(200)
        .json({ msg: "Post image successfully!", data: result });
    } catch (error) {
      return res.status(400).json({ msg: errorToString(error) });
    }
  },

  getAlbums: async (req: Request, res: Response) => {
    try {
      const size = Number(req.query.size);
      const page = Number(req.query.page);
      if (!size || !page) {
        throw new Error("Invalid params!");
      }

      const albums =
        (await prisma?.album.findMany({
          skip: size * (page - 1),
          take: size,
          orderBy: {
            created_at: "desc",
          },
          omit: {
            creator_id: true,
          },
          include: {
            creator: true,
            images: true,
          },
        })) || [];

      res.status(200).json({ data: albums });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  deleteAlbum: async (req: Request, res: Response) => {
    try {
      const albumId = Number(req.body.id);

      if (!albumId) {
        throw new Error("Invalid params!");
      }

      const albums = await prisma?.album.delete({
        where: {
          id: albumId,
        },
      });

      res.status(200).json({ msg: "Delete successfully!", data: albums });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },
};
