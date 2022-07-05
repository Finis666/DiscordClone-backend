const express = require("express");
const app = express();
const mongoose = require("mongoose");
const users = require("./api/routes/users");
const friends = require("./api/routes/friends");
const conversations = require("./api/routes/conversations");
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

app.listen(3001, () => console.log("Listening on port 3001"));
