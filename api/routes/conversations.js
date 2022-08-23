const Router = require("express").Router();
const messages = require("../utils/messages");
const auth = require("../middleware/auth");
const conversationAuth = require("../middleware/conversationAuth");
const conversation = require("../utils/conversations");

// getting all conversation chats
Router.get("/", auth, async (req, res) => {
  const responseConversations = await conversation.allConversations(req.user);
  res.send(responseConversations);
});

// getting messages for spesific conversation
Router.get("/:conversationId", [auth, conversationAuth], async (req, res) => {
  const responseGetMessages = await messages.getAllMessages(req.conversation);
  res.send(responseGetMessages);
});

// post a new message to conversation
Router.post("/:conversationId", [auth, conversationAuth], async (req, res) => {
  const responseNewMessage = await messages.newMessage(
    req.user,
    req.conversation,
    req.body.message
  );
  res.send(responseNewMessage);
});

module.exports = Router;
