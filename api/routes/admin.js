const Router = require("express").Router();
const adminAuth = require("../middleware/adminAuth.js");
const auth = require("../middleware/auth");

Router.get("/", [auth, adminAuth], (req, res) => {});

module.exports = Router;
