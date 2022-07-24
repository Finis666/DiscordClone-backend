const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
// getting all messages to a spesific conversation
async function getAllMessages(id) {
  try {
    const getMessages = await Messages.find({ conversationId: id });
    // if they haven't chat yet.
    if (getMessages.length === 0) {
      return [{ msg: "There is no messages.", success: true }];
    }
    return [{ msg: getMessages, success: true }];
  } catch (err) {
    return [{ msg: "Somthing went wrong", success: false }];
  }
}

// post a new message to conversation
async function newMessage(token, conversationId, message) {
  try {
    if (message.length < 1) {
      return [{ msg: "Method not allowed", success: false }];
    }
    if (message.length > 120) {
      return [
        { msg: "Message must be less then 120 letters long!", success: false },
      ];
    }
    let newMessage = new Messages({
      conversationId: conversationId,
      sender: token.userId,
      text: message,
    });
    await newMessage.save();
    return [{ msg: newMessage, success: true }];
  } catch (err) {
    return [{ msg: "Somthing went wrong", success: false }];
  }
}

// checking for users past, if they had chat together in the past
async function pastCheck(token, reqId) {
  try {
    const getConversation = await Conversation.findOne({
      members: [token.userId, reqId],
    });
    const getConversation_2 = await Conversation.findOne({
      members: [reqId, token.userId],
    });
    if (getConversation || getConversation_2) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}
module.exports = { getAllMessages, pastCheck, newMessage };
