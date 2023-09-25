import jwt from "jsonwebtoken";

const middlewareController = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.headers.token;
      if (!token) {
        return res.status(403).json("You are not authenticate");
      }
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, user) => {
        if (err) {
          return res.status(401).json("Token is not valid");
        }
        req.user = user;
        next();
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  verifyTokenAndAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      try {
        if (!req.user.admin) {
          return res
            .status(401)
            .json("You do not have the authority to perform this action");
        }
        next();
      } catch (err) {
        res.status(500).json(err);
      }
    });
  },
};

export default middlewareController;
