const mongoose = require("mongoose");
const friendsSchema = mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Friends = mongoose.model("friends", friendsSchema);

module.exports = Friends;
