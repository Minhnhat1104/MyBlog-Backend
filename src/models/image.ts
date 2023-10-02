import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Image = new Schema(
  {
    name: { type: String, require: true },
    imageUrl: {
      require: true,
      type: String,
    },
    description: { type: String, require: true, maxLength: 200 },
    author: { type: String, require: true },
  },
  { timestamps: true }
);

export default mongoose.model("Image", Image);
