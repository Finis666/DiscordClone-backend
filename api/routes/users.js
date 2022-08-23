const Router = require("express").Router();
const register = require("../utils/register");
const login = require("../utils/login");
const auth = require("../middleware/auth");
const {
  getUserData,
  changeUsername,
  forgotPassword,
  resetPassword,
  validateResetLink,
} = require("../utils/users");
const multer = require("multer");
const User = require("../models/User");
const path = require("path");

const dirname = path.resolve(__dirname, "../../");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dirname + "/public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".png");
  },
});

const upload = multer({ storage: storage }).single("image");

Router.post("/register", async (req, res) => {
  const registerResponse = await register(req.body);
  res.send(registerResponse);
});

Router.post("/login", async (req, res) => {
  const loginResponse = await login(req.body);
  res.send(loginResponse);
});

Router.get("/me", auth, async (req, res) => {
  const responseUserData = await getUserData(req.user);
  res.send({ msg: responseUserData, success: true });
});

Router.patch("/settings/upload/image", auth, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      res.send({ msg: "Image is not valid.", success: false });
    } else {
      try {
        const updateUser = await User.findByIdAndUpdate(req.user.userId, {
          image: req.file.filename,
        });
        await updateUser.save();
        res.send({ msg: "Success", image: req.file.filename, success: true });
      } catch (err) {
        res.send({ msg: "Somthing went wrong", success: false });
      }
    }
  });
});

Router.put("/settings/changeUsername", auth, async (req, res) => {
  const responseChangeUsername = await changeUsername(req.user, req.body);
  res.send(responseChangeUsername);
});

Router.post("/forgot-password", async (req, res) => {
  const responseForgotPassword = await forgotPassword(req.body);
  res.send(responseForgotPassword);
});

Router.get("/reset-password/:id/:token", async (req, res) => {
  const responseValidateResetLink = await validateResetLink(
    req.params.id,
    req.params.token
  );
  res.send(responseValidateResetLink);
});

Router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  const responseResetPassword = await resetPassword(id, token, password);
  res.send(responseResetPassword);
});

Router.get("/validateToken", auth, (req, res) => {
  res.send({
    msg: "Token is valid",
    username: req.user.username,
    userId: req.user.userId,
    image: req.user.image,
    isAdmin: req.user.isAdmin,
    success: true,
  });
});

module.exports = Router;
