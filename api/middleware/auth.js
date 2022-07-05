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
    const checkUser = await User.findOne({ username: decoded.username });
    if (!checkUser) {
      res.send({ msg: "User is not valid.", success: false });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.send({ msg: "Invalid token.", success: false });
  }
}

module.exports = auth;
