import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const refreshTokens = [];

const authController = {
  registerUser: async (req, res) => {
    try {
      const saltRounds = 10;
      const hash = bcrypt.hashSync(req.body.password, saltRounds);
      const newUser = await new User({
        username: req.body.username,
        password: hash,
        email: req.body.email,
      });
      const user = await newUser.save();
      res.status(202).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        username: user.username,
        admin: user.admin,
        id: user._id,
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "20s" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        username: user.username,
        admin: user.admin,
        id: user._id,
      },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "365d" }
    );
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json("Wrong username");
      }
      const validPassword = await bcrypt.compareSync(
        req.body.password,
        user.password
      ); // true
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
      const { password, ...other } = user._doc;
      res.status(200).json({ ...other, accessToken: accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  logoutUser: (req, res) => {
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

  requestRefreshToken: (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(404).json("You're not authenticated");
    }
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh is not valid");
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
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
    });
  },
};

export default authController;
