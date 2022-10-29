import Image from "../models/image.js";
import multer from "multer";
import fs from "fs";

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).single("file");

const imageController = {
  uploadImage: (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.log(err);
      } else {
        const newImage = new Image({
          name: req.body.name,
          image: {
            data: fs.readFileSync("uploads/" + req.file.filename),
            contentType: "image/png",
          },
          description: req.body.description,
          author: req.body.username,
        });
        newImage
          .save()
          .then(() => {
            res.status(200).json("upload success!");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  },

  getAllImage: async (req, res) => {
    try {
      const images = await Image.find();
      res.status(200).json(images);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getImageById: async (req, res) => {
    try {
      // const image = await Image.findById({ _id: req.params.id });
      const image = await Image.findById(req.params.id);
      res.status(200).json(image);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteImage: async (req, res) => {
    try {
      const image = await Image.findByIdAndDelete(req.params.id);
      //console.log(req.params.id);
      res.status(200).json("delete successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateImage: async (req, res) => {
    try {
      await Image.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        author: req.body.author,
      });

      res.status(200).json("update successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

export default imageController;
