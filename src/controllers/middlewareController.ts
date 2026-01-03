import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const middlewareController = {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        typeof req.headers.token === "string"
          ? req.headers.token
          : req.headers.token?.[0];
      if (!token) {
        return res.status(403).json({ msg: "You are not authenticate" });
      }
      const accessToken = token.split(" ")[1];
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_KEY || "",
        (err, user) => {
          // user is JWT payload
          if (err) {
            return res.status(401).json({ msg: "Token is not valid" });
          }
          if (typeof user !== "string") {
            req.user = {
              id: user?.id,
              username: user?.username,
              admin: user?.admin,
            };
          }
          next();
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  verifyTokenAndAdminAuth: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    middlewareController.verifyToken(req, res, () => {
      try {
        if (!req?.user?.admin) {
          return res
            .status(401)
            .json({
              msg: "You do not have the authority to perform this action",
            });
        }
        next();
      } catch (err) {
        res.status(500).json(err);
      }
    });
  },
};

export default middlewareController;
