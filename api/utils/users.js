const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();
async function getUserData(token) {
  try {
    const getUser = await User.findById(token.userId).select(["-password"]);
    return getUser;
  } catch (err) {
    return [{ msg: "Somthing went wrong", success: false }];
  }
}

async function changeUsername(token, data) {
  if (!data || data.length === 0) {
    return [{ msg: "Missing fields", success: false }];
  }
  if (data.username.length < 2 || data.username.length > 15) {
    return [{ msg: "Username must be between 2 and 15 in length" }];
  }
  try {
    const getUser = await User.findOne({ username: data.username });
    if (getUser) {
      return [
        { msg: "Username is already taken, try somthing else.", success: true },
      ];
    }
    const updateUser = await User.findByIdAndUpdate(token.userId, {
      username: data.username,
    });
    await updateUser.save();
    return [{ msg: "Username changed!", success: true }];
  } catch (err) {
    return [{ msg: "Somthing went wrong", success: false }];
  }
}

async function forgotPassword(data) {
  if (data.length === 0 || !data.email) {
    return [{ msg: "Missing fields", success: false }];
  }
  try {
    const getUser = await User.findOne({ email: data.email });
    if (!getUser) {
      return [{ msg: "Invalid email", success: false }];
    }
    const secret = process.env.TOKENSECRET + getUser.password;
    const token = jwt.sign({ id: getUser._id.toHexString() }, secret, {
      expiresIn: "15m",
    });

    let transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER, // generated ethereal user
        pass: process.env.SMTP_PASSWORD, // generated ethereal password
      }, // true for 465, false for other ports
    });

    let info = await transporter.sendMail({
      from: '"Discord Clone" <romt31305@gmail.com>', // sender address
      to: data.email, // list of receivers
      subject: "Reset Password", // Subject line
      text: "Reset Password!", // plain text body
      html: `<b>Here is a link to reset your password: <a href="${
        process.env.CLIENT_SIDE_URL
      }/reset-password/${getUser._id.toHexString()}/${token}">Click here</a></b>`, // html body
    });
    return [{ msg: "Linked sent", success: true }];
  } catch (err) {
    return [{ msg: "Somthing went wrong", success: false }];
  }
}

async function resetPassword(id, token, password) {
  try {
    const getUser = await User.findById(id);
    if (!getUser) {
      return [{ msg: "expired or invalid", success: false }];
    }
    const secret = process.env.TOKENSECRET + getUser.password;
    const payload = jwt.verify(token, secret);
    let passwordValidation = String(password).match(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=(.*[\d]){4,})(?=.*?[#?!@$%^&*-]).{8,}$/
    );
    if (!passwordValidation) {
      return [
        {
          msg: "Minimum eight charcters. one upper case letter at least, one lower case letter at least, four digit at least, one special character at least",
          success: false,
        },
      ];
    }
    const salt = await bcrypt.genSalt(10);
    const encryptedPass = await bcrypt.hash(password, salt);
    await getUser.updateOne({ password: encryptedPass });
    await getUser.save();
    return [{ msg: "success", success: true }];
  } catch (err) {
    console.log(err);
    return [{ msg: "Invalid credentials", success: false }];
  }
}

async function validateResetLink(id, token) {
  try {
    const getUser = await User.findById(id);
    if (!getUser) {
      return [{ msg: "expired or invalid", success: false }];
    }
    const secret = process.env.TOKENSECRET + getUser.password;
    const payload = jwt.verify(token, secret);
    return [{ msg: "valid", success: true }];
  } catch (err) {
    return [{ msg: "expired or invalid", success: false }];
  }
}

module.exports = {
  getUserData,
  changeUsername,
  forgotPassword,
  resetPassword,
  validateResetLink,
};
