import bcrypt from "bcrypt";
import { getCollection } from "@/config/mongoDB";
import { COLLECTION } from "@/config/types";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const refreshTokens: string[] = [];

const authController = {
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saltRounds = 10;
      const userCollection = getCollection(COLLECTION.User);
      const hash = bcrypt.hashSync(req.body.password, saltRounds);
      const result = await userCollection.insertOne({
        username: req.body.username,
        password: hash,
        email: req.body.email,
      });

      if (!result.acknowledged) {
        throw new Error("Movie insertion was not acknowledged by the database");
      }

      // Retrieve the created document to return complete data
      const createdUser = await userCollection.findOne({
        _id: result.insertedId,
      });
      res.status(202).json(createdUser);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  generateAccessToken: (user: any) => {
    return jwt.sign(
      {
        username: user.username,
        admin: user.admin,
        id: user._id,
      },
      process.env.ACCESS_TOKEN_KEY || "",
      { expiresIn: "20s" }
    );
  },

  generateRefreshToken: (user: any): string => {
    return jwt.sign(
      {
        username: user.username,
        admin: user.admin,
        id: user._id,
      },
      process.env.REFRESH_TOKEN_KEY || "",
      { expiresIn: "365d" }
    );
  },

  loginUser: async (req: Request, res: Response) => {
    try {
      const userCollection = getCollection(COLLECTION.User);

      const user = await userCollection.findOne({
        username: req.body.username,
      });

      if (!user) {
        return res.status(404).json("Wrong username");
      }
      // const validPassword = await bcrypt.compareSync(
      //   req.body.password,
      //   user.password
      // ); // true
      const validPassword = user.password === req.body.password;
      if (!validPassword) {
        return res.status(404).json("Wrong password");
      }
      const accessToken = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      const { password, ...other } = user;
      res.status(200).json({ ...other, accessToken: accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  logoutUser: (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshToken", {
        path: "/",
      });
      refreshTokens.filter((token) => token !== req.cookies.refreshToken);
      res.status(200).json("logout successfully");
    } catch (err) {
      console.log(err);
    }
  },

  requestRefreshToken: (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(404).json("You're not authenticated");
    }
    // if (!refreshTokens.includes(refreshToken)) {
    //   return res.status(403).json("Refresh is not valid");
    // }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_KEY || "",
      (err: VerifyErrors | null, user: any) => {
        if (err) {
          return console.log(err);
        }
        refreshTokens.filter((token) => token !== refreshToken);
        const newAccessToken = authController.generateAccessToken(user);
        const newRefreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(newRefreshToken);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        res.status(200).json({ accessToken: newAccessToken });
      }
    );
  },
};

export default authController;
