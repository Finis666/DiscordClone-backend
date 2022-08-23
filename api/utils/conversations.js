const Conversation = require("../models/Conversation");
const User = require("../models/User");
async function allConversations(token) {
  try {
    const getConversation = await Conversation.find({
      members: {
        $in: [token.userId],
      },
    });
    if (getConversation.length === 0) {
      return [{ msg: "You have no conversations", success: false }];
    }
    let conversationList = [];
    for (let i = 0; i < getConversation.length; i++) {
      for (let m = 0; m < getConversation[i].members.length; m++) {
        if (getConversation[i].members[m] !== token.userId) {
          let getUser = await User.findById(getConversation[i].members[m]);
          conversationList.push({
            userId: getConversation[i].members[m],
            username: getUser.username,
            image: getUser.image,
            active: false,
          });
        }
      }
    }
    return [{ msg: conversationList, success: true }];
  } catch (err) {
    return [{ msg: "Somthing went wrong, try again later", success: false }];
  }
}
module.exports = { allConversations };
