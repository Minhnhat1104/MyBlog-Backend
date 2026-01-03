import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma.config";

const refreshTokens: string[] = [];

const authController = {
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saltRounds = 10;
      const hash = bcrypt.hashSync(req.body.password, saltRounds);
      const newUser = await prisma?.user.create({
        data: {
          username: req.body.username,
          password: hash,
          admin: false,
          email: req.body.email,
        },
      });

      if (newUser) {
        const { password, ...rest } = newUser;
        res.status(202).json({ user: rest });
      }
    } catch (err) {
      res.status(400).json({ msg: err });
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
      const user = await prisma?.user.findFirst({
        where: {
          username: req.body.username || "",
        },
      });

      if (!user) {
        return res.status(404).json({ msg: "Wrong username" });
      }
      const validPassword = await bcrypt.compareSync(
        req.body.password,
        user.password
      );
      // const validPassword = user.password === req.body.password;
      if (!validPassword) {
        return res.status(404).json({ msg: "Wrong password" });
      }
      const accessToken = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      res.cookie("refreshToken", refreshToken, {
        // httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      const { password, ...other } = user;
      res.status(200).json({ data: { ...other, accessToken: accessToken } });
    } catch (err) {
      res.status(400).json({ msg: err });
    }
  },

  logoutUser: (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshToken", {
        path: "/",
      });
      refreshTokens.filter((token) => token !== req.cookies.refreshToken);
      res.status(200).json({ msg: "logout successfully" });
    } catch (err) {
      console.log(err);
    }
  },

  requestRefreshToken: (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "You're not authenticated" });
    }
    // if (!refreshTokens.includes(refreshToken)) {
    //   return res.status(403).json({msg: "Refresh is not valid"});
    // }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_KEY || "",
      (err: VerifyErrors | null, user: any) => {
        if (err) {
          console.log(err);
          return res
            .status(401)
            .json({ msg: "Your login information is invalid.", err });
        }
        refreshTokens.filter((token) => token !== refreshToken);
        const newAccessToken = authController.generateAccessToken(user);
        const newRefreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(newRefreshToken);
        res.cookie("refreshToken", newRefreshToken, {
          // httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        res
          .status(200)
          .json({ data: { ...user, accessToken: newAccessToken } });
      }
    );
  },
};

export default authController;
