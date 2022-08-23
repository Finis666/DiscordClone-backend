const Router = require("express").Router();
const adminAuth = require("../middleware/adminAuth.js");
const { getUsersPagination, banUser, editUser } = require("../utils/admin");

Router.get("/", [adminAuth], async (req, res) => {
  const responseGetUserPagination = await getUsersPagination(req.query.page);
  res.send(responseGetUserPagination);
});

Router.put("/ban", [adminAuth], async (req, res) => {
  const responseBanUser = await banUser(req.body.userId, req.user);
  res.send(responseBanUser);
});

Router.put("/edituser", adminAuth, async (req, res) => {
  const responseEdituser = await editUser(req.body, req.user);
  res.send(responseEdituser);
});

module.exports = Router;
