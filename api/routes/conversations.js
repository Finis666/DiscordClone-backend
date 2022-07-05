const Router = require("express").Router();
const messages = require("../controllers/messages");
const auth = require("../middleware/auth");
const conversationAuth = require("../middleware/conversationAuth");

Router.get("/:conversationId", [auth, conversationAuth], (req, res) => {
  res.send("ya");
});

module.exports = Router;
