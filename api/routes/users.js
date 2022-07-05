const Router = require("express").Router();
const register = require("../controllers/register");
const login = require("../controllers/login");
const auth = require("../middleware/auth");

Router.post("/register", async (req, res) => {
  let registerResponse = await register(req.body);
  res.send(registerResponse);
});

Router.post("/login", async (req, res) => {
  let loginResponse = await login(req.body);
  res.send(loginResponse);
});

Router.get("/validateToken", auth, (req, res) => {
  res.send({
    msg: "Token is valid",
    username: req.user.username,
    success: true,
  });
});

module.exports = Router;
