const auth = require("../middleware/auth");
const friends = require("../controllers/friends");
const Router = require("express").Router();

Router.get("/all", auth, async (req, res) => {
  let getFriendsResponse = await friends.getFriends(req.user);
  res.send(getFriendsResponse);
});

Router.post("/addFriend", auth, async (req, res) => {
  let addFriendResponse = await friends.addFriend(req.user, req.body);
  res.send(addFriendResponse);
});

Router.put("/acceptFriend", auth, async (req, res) => {
  let acceptFriendResponse = await friends.acceptFriend(req.user, req.body);
  res.send(acceptFriendResponse);
});

Router.put("/declineRequest", auth, async (req, res) => {
  let declineRequestResponse = await friends.declineRequest(req.user, req.body);
  res.send(declineRequestResponse);
});

Router.get("/pending", auth, async (req, res) => {
  let pendingResponse = await friends.pendingRequest(req.user);
  res.send(pendingResponse);
});
module.exports = Router;
