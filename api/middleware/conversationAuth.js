const Conversation = require("../models/Conversation");
// checking if conversation is valid
async function conversationAuth(req, res, next) {
  try {
    let getConversation = await Conversation.findById(
      req.params.conversationId
    );
    if (!getConversation) {
      res.send([{ msg: "Conversation not found.", success: false }]);
    } else {
      next();
    }
  } catch (err) {
    res.send([
      { msg: "Somthing went wrong, try again later.", success: false },
    ]);
  }
}
module.exports = conversationAuth;
