const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
async function login(data) {
  try {
    let findUserByEmail = await User.find({ email: data.emailOrUsername });
    let findUserByUsername = await User.find({
      username: data.emailOrUsername,
    });
    if (findUserByEmail.length > 0) {
      let comparePass = await bcrypt.compare(
        data.password,
        findUserByEmail[0].password
      );
      if (comparePass) {
        let token = jwt.sign(
          { userId: findUserByEmail[0]._id.toHexString() },
          process.env.TOKENSECRET
        );
        return [
          {
            msg: "Logged in",
            success: true,
            username: findUserByEmail[0].username,
            userId: findUserByEmail[0]._id,
            isAdmin: findUserByEmail[0].isAdmin,
            token: token,
          },
        ];
      } else {
        return [{ msg: "One of your fields are incorrect", status: false }];
      }
    } else if (findUserByUsername.length > 0) {
      let comparePass = await bcrypt.compare(
        data.password,
        findUserByUsername[0].password
      );
      if (comparePass) {
        let token = jwt.sign(
          { userId: findUserByUsername[0]._id.toHexString() },
          process.env.TOKENSECRET
        );
        return [
          {
            msg: "Logged in",
            success: true,
            username: findUserByUsername[0].username,
            userId: findUserByUsername[0]._id,
            isAdmin: findUserByUsername[0].isAdmin,
            token: token,
          },
        ];
      } else {
        return [{ msg: "One of your fields are incorrect", status: false }];
      }
    } else {
      return [{ msg: "One of your fields are incorrect", status: false }];
    }
  } catch (err) {
    console.log(err);
    return [{ msg: "Missing fields", success: false }];
  }
}

module.exports = login;
