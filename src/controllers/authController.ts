import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma.config";
import { errorToString } from "@/tools/error";
import crypto from "crypto";
import dayjs from "dayjs";
import { User } from "generated/prisma/client";
import { BCRYPT_ROUNDS } from "@/config/constants";

const refreshTokens: string[] = [];

const authController = {
  testPing: async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ msg: "Ping successfully!" });
  },
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hash = bcrypt.hashSync(req.body.password, BCRYPT_ROUNDS);
      const result = await prisma?.user.create({
        omit: {
          password: true,
          password_reset_token: true,
          password_reset_expired: true,
        },
        data: {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: req.body.email,
          password: hash,
          admin: false,
        },
      });

      if (result) {
        res.status(202).json({ msg: "Register successfully!", user: result });
      }
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },

  generateAccessToken: (user: any) => {
    return jwt.sign(
      {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_id: user.avatar_id,
        admin: user.admin,
        id: user.id,
      },
      process.env.ACCESS_TOKEN_KEY || "",
      { expiresIn: "15m" },
    );
  },

  generateRefreshToken: (user: any): string => {
    return jwt.sign(
      {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_id: user.avatar_id,
        admin: user.admin,
        id: user.id,
      },
      process.env.REFRESH_TOKEN_KEY || "",
      { expiresIn: "30d" },
    );
  },

  loginUser: async (req: Request, res: Response) => {
    try {
      const user = await prisma?.user.findFirst({
        where: {
          email: req.body.email || "",
          password: {
            not: null,
          },
        },
      });

      if (!user || !user?.password) {
        return res.status(404).json({ msg: "Wrong email" });
      }
      const validPassword = await bcrypt.compareSync(
        req.body.password,
        user.password,
      );
      // const validPassword = user.password === req.body.password;
      if (!validPassword) {
        return res.status(404).json({ msg: "Wrong password" });
      }

      const {
        password: temp,
        password_reset_expired,
        password_reset_token,
        ...tokenPayload
      } = user;
      const accessToken = authController.generateAccessToken(tokenPayload);
      const refreshToken = authController.generateRefreshToken(tokenPayload);
      refreshTokens.push(refreshToken);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      res
        .status(200)
        .json({ rows: { ...tokenPayload, accessToken: accessToken } });
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
      async (err: VerifyErrors | null, user: any) => {
        if (err) {
          console.log(err);
          return res
            .status(401)
            .json({ msg: "Your login information is invalid.", err });
        }

        // refreshTokens.filter((token) => token !== refreshToken);
        const nTokenPayload = await prisma?.user.findUnique({
          omit: {
            password: true,
            password_reset_expired: true,
            password_reset_token: true,
          },
          where: {
            id: user?.id,
          },
        });

        if (!nTokenPayload) {
          return res
            .status(401)
            .json({ msg: "Your login information is invalid.", err });
        }

        const newAccessToken =
          authController.generateAccessToken(nTokenPayload);
        const newRefreshToken =
          authController.generateRefreshToken(nTokenPayload);
        refreshTokens.push(newRefreshToken);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        res
          .status(200)
          .json({ rows: { ...nTokenPayload, accessToken: newAccessToken } });
      },
    );
  },

  oauth2LoginCallback: async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" },
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" },
      );

      res.redirect(
        `${process.env.CLIENT_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    } catch (err) {
      res.status(400).json({ msg: errorToString(err) });
    }
  },
};

export default authController;
