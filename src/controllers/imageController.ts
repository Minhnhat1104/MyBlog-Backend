import multer from "multer";
// import {
//   getStorage,
//   ref,
//   getDownloadURL,
//   uploadBytesResumable,
// } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/config/firebase.config";
import { getCollection } from "@/config/mongoDB";
import { COLLECTION } from "@/config/types";

// Initialize Firebase
initializeApp(firebaseConfig);

// const storage = getStorage();

export const upload = multer({
  storage: multer.memoryStorage(),
}).single("file");

const imageController = {
  uploadImage: async (req, res) => {
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

  getAllImage: async (req, res) => {
    try {
      if (req.query.initial_num && req.query.per_page && req.query.page) {
        await imageController.getImagePerPage(req, res);
      } else {
        const imageCollection = getCollection(COLLECTION.Image);

        const images = await imageCollection.find();
        return res.status(200).json(images);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getImagePerPage: async (req, res) => {
    try {
      const imageCollection = getCollection(COLLECTION.Image);

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
      const images = await imageCollection.find().limit(skipNum + getNum);
      res.status(200).json(images);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getImageById: async (req, res) => {
    try {
      const imageCollection = getCollection(COLLECTION.Image);

      const image = await imageCollection.findOne({ _id: req.params.id });
      res.status(200).json(image);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteImage: async (req, res) => {
    try {
      const imageCollection = getCollection(COLLECTION.Image);

      const result = await imageCollection.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) {
        throw new Error("Image not found!");
      }
      res.status(200).json("delete successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateImage: async (req, res) => {
    try {
      const imageCollection = getCollection(COLLECTION.Image);
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        author: req.body.author,
      };

      const result = await imageCollection.updateOne(
        //  { _id: new ObjectId(id) },
        { _id: req.params.id },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new Error("Movie not found");
      }

      res.status(200).json("update successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

export default imageController;
