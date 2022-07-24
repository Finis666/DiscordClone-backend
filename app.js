const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const mongoose = require("mongoose");
const users = require("./api/routes/users");
const friends = require("./api/routes/friends");
const conversations = require("./api/routes/conversations");
const admin = require("./api/routes/admin");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("dev"));

app.use(cors());
// mongoose connnection
mongoose
  .connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Connection faild " + err);
  });

// routes
app.use("/api/users", users);
app.use("/api/friends", friends);
app.use("/api/conversations", conversations);
app.use("/api/admin", admin);

// handling web sockets
let usersList = [];
// adding user to list
const handleAddUser = (userId, socketId) => {
  !usersList.some((val) => val.userId === userId) &&
    usersList.push({ userId: userId, socketId: socketId });
};
// removing user from list
const removeUser = (socketId) => {
  usersList = usersList.filter((user) => {
    return user.socketId !== socketId;
  });
};
// getting user from list
const getUserId = (socketId) => {
  let userId = usersList.find((user) => {
    return user.socketId === socketId;
  });
  return userId;
};
// getting user by id from list
const getUserById = (userId) => {
  let getUser = usersList.find((user) => {
    // console.log(user);
    return user.userId === userId;
  });
  return getUser;
};
io.on("connection", (socket) => {
  //handling user on join
  socket.on("addUser", (user) => {
    handleAddUser(user.userId, socket.id);
    io.emit("getUsers", usersList);
  });

  //handling user on accepting pending request
  socket.on("pending_accept", (user) => {
    let getAcceptedFriend = getUserById(user.reqId);
    if (getAcceptedFriend) {
      io.to(getAcceptedFriend.socketId).emit("pending_accepted", {
        reqUserId: user.currUserId,
        reqUsername: user.currUsername,
      });
      io.to(socket.id).emit("userIsOnline", user.reqId);
    }
  });

  //handling friend request send
  socket.on("friend_request_send", (data) => {
    let getFriend = getUserById(data.friendId);
    if (getFriend) {
      io.to(getFriend.socketId).emit("friend_request_get", {
        username: data.username,
        userId: data.userId,
      });
      return;
    }
  });

  // handling new message recive
  socket.on("new_message", (data) => {
    let getFriend = getUserById(data.friendId);
    if (getFriend) {
      io.to(getFriend.socketId).emit("new_message_get", {
        username: data.username,
        userId: data.userId,
        text: data.text,
      });
      return;
    }
  });

  socket.on("disconnect", () => {
    let userId = getUserId(socket.id);
    removeUser(socket.id);
    io.emit("removeFromActive", userId);
  });
});
server.listen(3001, () => console.log("Listening on port 3001"));
