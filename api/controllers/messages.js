const Conversation = require("../models/Conversation");
async function getAllMessages(token, conversationId) {
  try {
  } catch (err) {}
}
// checking for users past, if they had chat together in the past
async function pastCheck(token, friendUsername) {
  try {
    const getConversation = await Conversation.findOne({
      members: [token.username, friendUsername],
    });
    const getConversation_2 = await Conversation.findOne({
      members: [friendUsername, token.username],
    });
    if (getConversation || getConversation_2) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}
module.exports = { getAllMessages, pastCheck };
