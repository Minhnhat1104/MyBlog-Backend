import Image from "../models/image.ts";
import multer from "multer";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebase.config";

// Initialize Firebase
initializeApp(firebaseConfig);
console.log("FirebaseConfig:", firebaseConfig);

const storage = getStorage();

export const upload = multer({
  storage: multer.memoryStorage(),
}).single("file");

const imageController = {
  uploadImage: async (req, res) => {
    try {
      const dateTime = giveCurrentDateTime();

      const storageRef = ref(
        storage,
        `files/${req.file.originalname + "       " + dateTime}`
      );

      // Create file metadata including the content type
      const metadata = {
        contentType: req.file.mimetype,
      };

      // Upload the file in the bucket storage
      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

      // Grab the public url
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File successfully uploaded.");

      const newImage = new Image({
        name: req.body.name,
        imageUrl: downloadURL,
        description: req.body.description,
        author: req.body.username,
      });

      await newImage.save();

      return res.status(200).json({
        message: "file uploaded to firebase storage",
        name: req.file.originalname,
        type: req.file.mimetype,
        downloadURL: downloadURL,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAllImage: async (req, res) => {
    try {
      if (req.query.initial_num && req.query.per_page && req.query.page) {
        console.log("navigate image per page");
        await imageController.getImagePerPage(req, res);
      } else {
        const images = await Image.find();
        return res.status(200).json(images);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getImagePerPage: async (req, res) => {
    try {
      const initalNum = Number(req.query.initial_num);
      const perPage = Number(req.query.per_page);
      const page = Number(req.query.page);
      console.log("Paging: ", initalNum, perPage, page);
      let skipNum = initalNum + perPage * (page - 1);
      let getNum = perPage;
      if (page === 0) {
        skipNum = 0;
        getNum = initalNum;
      }
      const images = await Image.find().limit(skipNum + getNum);
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

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};

export default imageController;
