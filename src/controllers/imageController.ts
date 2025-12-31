import multer from "multer";

import { Request, Response } from "express";
import { prisma } from "@/config/prisma.config";

// const storage = getStorage();

export const upload = multer({
  storage: multer.memoryStorage(),
}).single("file");

const imageController = {
  uploadImage: async (req: Request, res: Response) => {
    try {
      // const dateTime = giveCurrentDateTime();
      // const storageRef = ref(
      //   storage,
      //   `files/${req.file.originalname + "       " + dateTime}`
      // );
      // // Create file metadata including the content type
      // const metadata = {
      //   contentType: req.file.mimetype,
      // };
      // // Upload the file in the bucket storage
      // const snapshot = await uploadBytesResumable(
      //   storageRef,
      //   req.file.buffer,
      //   metadata
      // );
      // //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
      // // Grab the public url
      // const downloadURL = await getDownloadURL(snapshot.ref);
      // console.log("File successfully uploaded.");
      // const newImage = new Image({
      //   name: req.body.name,
      //   imageUrl: downloadURL,
      //   description: req.body.description,
      //   author: req.body.username,
      // });
      // await newImage.save();
      // return res.status(200).json({
      //   message: "file uploaded to firebase storage",
      //   name: req.file.originalname,
      //   type: req.file.mimetype,
      //   downloadURL: downloadURL,
      // });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAllImage: async (req: Request, res: Response) => {
    try {
      if (req.query.size && req.query.page) {
        await imageController.getImagePerPage(req, res);
      } else {
        const images = await prisma?.image.findMany({
          orderBy: {
            created_at: "desc",
          },
        });
        return res.status(200).json(images);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getImagePerPage: async (req: Request, res: Response) => {
    try {
      const size = Number(req.query.size);
      const page = Number(req.query.page);
      console.log("Paging: ", size, page);

      const images = await prisma?.image.findMany({
        skip: size * (page - 1),
        take: size,
        orderBy: {
          created_at: "desc",
        },
      });
      res.status(200).json(images);
    } catch (err) {
      res.status(500).json(err);
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
      res.status(500).json(err);
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
      res.status(200).json("delete successfully");
    } catch (err) {
      res.status(500).json(err);
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

      res.status(200).json("update successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

export default imageController;
