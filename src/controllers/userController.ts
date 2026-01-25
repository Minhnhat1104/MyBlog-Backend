import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { errorToString } from "@/tools/error";
import path from "path";
import fs, { lstat } from "fs";
import { getImageSize } from "@/tools/image";
import { BCRYPT_ROUNDS } from "@/config/constants";
import { AuthProvider } from "generated/prisma/enums";

const userAvatarPlaceholder = path.join(
  process.cwd(),
  "src",
  "assets",
  "UserPlaceholder.png",
);

const userController = {
  getAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req?.query?.id || "");

      if (!userId) {
        throw new Error("Invalid request!");
      }

      const result = await prisma?.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          avatar: true,
        },
      });

      if (!result || !result?.avatar) {
        return res?.sendFile(userAvatarPlaceholder);
      }

      res.sendFile(result?.avatar || "");
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  deleteAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req?.user?.id || "");

      if (!userId) {
        throw new Error("Invalid request!");
      }

      const result = await prisma?.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: null,
        },
      });

      res.status(200).json({ msg: "Delete data successfully!", result });
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

      const result = await prisma?.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: req?.file?.path,
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
      const firstName = req?.body?.firstName;
      const lastName = req?.body?.lastName;
      const userId = Number(req?.user?.id || "");
      // const email = req?.body?.email;

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

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const oldPassword = req?.body?.oldPassword;
      const newPassword = req?.body?.newPassword;
      const userId = req?.user?.id;

      if (!oldPassword || !newPassword) {
        throw new Error("Invalid params!");
      }

      const result = await prisma?.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!result?.password || result?.provider !== AuthProvider.local) {
        throw new Error("Invalid auth provider!");
      }

      if (!result) {
        throw new Error("User not found");
      }

      const isOldPassCorrect = await bcrypt.compareSync(
        oldPassword,
        result?.password,
      );

      if (!isOldPassCorrect) {
        throw new Error("Incorrect current password!");
      }

      const hash = bcrypt.hashSync(newPassword, BCRYPT_ROUNDS);

      await prisma?.user?.update({
        where: {
          id: userId,
        },
        data: {
          password: hash,
        },
      });

      if (!result) {
        throw new Error("Change password failed");
      }

      res.status(200).json({ msg: "Change password successfully" });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },
};

export default userController;
