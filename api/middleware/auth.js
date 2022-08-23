const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
async function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    res.send({ msg: "Access denied. No Token provided", success: false });
    return;
  }
  try {
    //checking if token valid
    const decoded = jwt.verify(token, process.env.TOKENSECRET);
    //checking if user is valid before continue
    const checkUser = await User.findById(decoded.userId);
    if (!checkUser) {
      res.send({ msg: "User is not valid.", success: false });
      return;
    }
    if (checkUser.isDeleted) {
      res.send({ msg: "This user is banned, You can no longer login." });
      return;
    }
    let decodedReq = {
      ...decoded,
      username: checkUser.username,
      image: checkUser.image,
      isAdmin: checkUser.isAdmin,
    };
    req.user = decodedReq;
    next();
  } catch (err) {
    res.send({ msg: "Invalid token.", success: false });
  }
}

module.exports = auth;
