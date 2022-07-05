const mongoose = require("mongoose");
const friendsSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  friends: {
    type: Array,
    default: [],
  },
});

const Friends = mongoose.model("friends", friendsSchema);

module.exports = Friends;
