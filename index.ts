import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {MongoClient, ServerApiVersion} from "mongodb";
import cookieParser from "cookie-parser";
import { default as authRouter } from "./src/routes/auth";
import { default as imageRouter } from "./src/routes/image";
// Import the functions you need from the SDKs you need

dotenv.config();
const app = express();

app.use(express.static("public"));
const uri = process.env.CONNECTION_STRING || '';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//routes
app.use("/v1/auth", authRouter);
app.use("/v1/image", imageRouter);

const port = process.env.PORT || 8000;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server is running at ${port}`);
  }
});
