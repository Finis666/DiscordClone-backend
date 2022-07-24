const Conversation = require("../models/Conversation");
// checking if conversation is valid
async function conversationAuth(req, res, next) {
  let token = req.user;
  let reqId = req.params.conversationId;
  try {
    let getConversation = await Conversation.findOne({
      members: [token.userId, reqId],
    });
    let getConversation_2 = await Conversation.findOne({
      members: [reqId, token.userId],
    });
    if (!getConversation && !getConversation_2) {
      res.send([{ msg: "Conversation not found.", success: false }]);
    } else {
      if (getConversation !== null) {
        req.conversation = getConversation._id.toHexString();
        next();
        return;
      }
      if (getConversation_2 !== null) {
        req.conversation = getConversation_2._id.toHexString();
        next();
        return;
      }
    }
  } catch (err) {
    res.send([
      { msg: "Somthing went wrong, try again later.", success: false },
    ]);
  }
}
module.exports = conversationAuth;
