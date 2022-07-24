const Router = require("express").Router();
const adminAuth = require("../middleware/adminAuth.js");

Router.get("/", [adminAuth], (req, res) => {});

module.exports = Router;
