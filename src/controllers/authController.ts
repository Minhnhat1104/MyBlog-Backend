import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { errorToString } from "@/tools/error";
import crypto from "crypto";
import dayjs from "dayjs";

const refreshTokens: string[] = [];

const authController = {
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saltRounds = 10;
      const hash = bcrypt.hashSync(req.body.password, saltRounds);
      const newUser = await prisma?.user.create({
        data: {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: req.body.email,
          password: hash,
          admin: false,
        },
      });

      if (newUser) {
        const { password, ...rest } = newUser;
        res.status(202).json({ user: rest });
      }
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  generateAccessToken: (user: any) => {
    return jwt.sign(
      {
        email: user.email,
        admin: user.admin,
        id: user.id,
      },
      process.env.ACCESS_TOKEN_KEY || "",
      { expiresIn: "15m" }
    );
  },

  generateRefreshToken: (user: any): string => {
    return jwt.sign(
      {
        email: user.email,
        admin: user.admin,
        id: user.id,
      },
      process.env.REFRESH_TOKEN_KEY || "",
      { expiresIn: "30d" }
    );
  },

  loginUser: async (req: Request, res: Response) => {
    try {
      const user = await prisma?.user.findFirst({
        where: {
          email: req.body.email || "",
        },
      });

      if (!user) {
        return res.status(404).json({ msg: "Wrong email" });
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
      res.status(200).json({ rows: { ...other, accessToken: accessToken } });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
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
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  sendResetPasswordEmail: async (req: Request, res: Response) => {
    try {
      const email = req?.body?.email;
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const result = await prisma?.user.update({
        where: {
          email: email,
        },
        data: {
          password_reset_token: hashedToken,
          password_reset_expired: dayjs().add(15, "m")?.toDate(),
        },
      });

      if (!result) {
        throw new Error("Request reset password failed");
      }

      res.status(200).json({ msg: "Successfully", data: { token } });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const token = req.body.token;
      const password = req.body.password;

      if (!token || !password) {
        throw new Error("Invalid params.");
      }

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const result = await prisma?.user.findUnique({
        where: {
          password_reset_token: hashedToken,
          password_reset_expired: {
            gte: new Date(),
          },
        },
      });

      if (!result) {
        throw new Error("Invalid token.");
      }

      res.status(200).json({ msg: "Successfully" });
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
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
          .json({ rows: { ...user, accessToken: newAccessToken } });
      }
    );
  },
};

export default authController;
