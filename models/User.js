import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      maxLength: 50,
    },
    password: {
      type: String,
      require: true,
    },
    admin: {
      type: Boolean,
      require: true,
      default: false,
    },
    email: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", User);
