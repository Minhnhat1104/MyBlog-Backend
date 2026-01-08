import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { errorToString } from "@/tools/error";
import path from "path";
import fs, { lstat } from "fs";
import { getImageSize } from "@/tools/image";

const userAvatarPlaceholder = path.join(
  process.cwd(),
  "src",
  "assets",
  "UserPlaceholder.png"
);

const userController = {
  getAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req?.query?.id || "");

      if (!userId) {
        throw new Error("Invalid request!");
      }

      console.log(fs.existsSync(userAvatarPlaceholder));

      const result = await prisma?.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          avatar: {
            select: {
              path: true,
            },
          },
        },
      });

      if (!result || !result?.avatar?.path) {
        return res?.sendFile(userAvatarPlaceholder);
      }

      res.sendFile(result?.avatar?.path || "");
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  updateAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ext = path.extname(req?.file?.originalname || "");
      const userId = Number(req?.user?.id || "");
      if (!req?.file?.path || !fs.existsSync(req?.file?.path || "")) {
        throw new Error("File not found.");
      }
      if (!userId) {
        throw new Error("Invalid request!");
      }

      const { width, height } = await getImageSize(req?.file?.path);

      const result = await prisma?.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: {
            create: {
              ext,
              width: width || 0,
              height: height || 0,
              path: req?.file?.path || "",
              name: req?.file?.originalname,
              creator_id: userId,
            },
          },
        },
      });

      if (!result) {
        throw new Error("Set avater failed");
      }

      res.status(200).json({ msg: "Set avatar successfully" });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const firstName = req?.body?.first_name;
      const lastName = req?.body?.last_name;
      // const email = req?.body?.email;
      const ext = path.extname(req?.file?.originalname || "");
      const userId = Number(req?.user?.id || "");
      if (!req?.file?.path || !fs.existsSync(req?.file?.path || "")) {
        throw new Error("File not found.");
      }
      if (!firstName || !lastName || !userId) {
        throw new Error("Invalid request!");
      }

      const result = await prisma?.user.update({
        where: {
          id: userId,
        },
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (!result) {
        throw new Error("Update failed");
      }

      res.status(200).json({ msg: "Update successfully" });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },
};

export default userController;
