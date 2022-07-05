const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
async function register(data) {
  let handleErrors = [];
  try {
    let emailValidation = String(data.email)
      .toLowerCase()
      .match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
    if (emailValidation === null) {
      handleErrors.push({
        field: "email",
        msg: "EMAIL - Email is not valid.",
        success: false,
      });
    }
    if (data.username.length < 2 || data.username.length > 32) {
      handleErrors.push({
        field: "username",
        msg: "USERNAME - Must be between 2 and 32 in length",
        sucess: false,
      });
    }
    let passwordValidation = String(data.password).match(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=(.*[\d]){4,})(?=.*?[#?!@$%^&*-]).{8,}$/
    );
    if (passwordValidation === null) {
      handleErrors.push({
        field: "password",
        msg: "Minimum eight charcters. one upper case letter at least, one lower case letter at least, four digit at least, one special character at least ",
        sucess: false,
      });
    }
    // checking if email or username already exists
    let checkEmail = await User.findOne({ email: data.email.toLowerCase() });
    let checkUsername = await User.findOne({
      username: data.username,
    });
    if (checkUsername) {
      handleErrors.push({
        field: "username",
        msg: "USERNAME - Username already in used.",
        success: false,
      });
    }
    if (checkEmail) {
      handleErrors.push({
        field: "email",
        msg: "EMAIL - Email already in used.",
        success: false,
      });
    }
    if (handleErrors.length > 0) {
      return handleErrors;
    } else {
      const saltRounds = 10;
      let salt = await bcrypt.genSalt(saltRounds);
      let hashPassword = await bcrypt.hash(data.password, salt);
      let newUser = new User({
        email: data.email.toLowerCase(),
        username: data.username,
        password: hashPassword,
      });
      await newUser.save();
      let token = jwt.sign(
        { username: data.username },
        process.env.TOKENSECRET
      );
      return [
        {
          msg: "User created.",
          token: token,
          username: data.username,
          success: true,
        },
      ];
    }
  } catch (err) {
    return [{ msg: "Missing fields", success: false }];
  }
}

module.exports = register;
