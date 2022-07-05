const Friends = require("../models/Friends");
const User = require("../models/User");
const { pastCheck } = require("./messages");
const Conversation = require("../models/Conversation");
async function getFriends(data) {
  try {
    let getCurrUserFriends = await Friends.findOne({
      username: data.username,
    });
    // checking for if friends exists
    if (getCurrUserFriends === null) {
      return [{ msg: "You have no friends :(", success: true }];
    } else {
      getCurrUserFriends = getCurrUserFriends.friends.filter((item) => {
        return item.status === "accept";
      });
      return [{ msg: getCurrUserFriends, success: true }];
    }
  } catch (err) {
    return [{ msg: "Somthing went wrong", success: false }];
  }
}

async function addFriend(token, reqData) {
  try {
    if (reqData.username == undefined) {
      return [{ msg: "Please fill fields", success: false }];
    }
    let checkIfFriendExists = await User.findOne({
      username: reqData.username,
    });
    // checking if user from request exists
    if (!checkIfFriendExists) {
      return [{ msg: "Friend doesn't exists!", success: false }];
    }
    let getCurrUser = await User.findOne({ username: token.username }).select([
      "-password",
      "-isAdmin",
    ]);
    if (getCurrUser.username === reqData.username) {
      return [{ msg: "You can't add yourself!", success: false }];
    }
    let getCurrFriends = await Friends.findOne({
      username: getCurrUser.username,
    });
    if (!getCurrFriends) {
      let addFriendCurUser = new Friends({
        username: getCurrUser.username,
        friends: [
          {
            username: reqData.username,
            status: "pending",
          },
        ],
      });
      await addFriendCurUser.save();
      let checkIfFriendHasFriends = await Friends.findOne({
        username: checkIfFriendExists.username,
      });
      if (!checkIfFriendHasFriends) {
        let addFriendReq = new Friends({
          username: checkIfFriendExists.username,
          friends: [
            {
              username: getCurrUser.username,
              status: "waiting",
            },
          ],
        });
        await addFriendReq.save();
        return [{ msg: "You have sent a friend request!", success: true }];
      } else {
        let addFriend = await Friends.findOne({
          username: checkIfFriendExists.username,
        });
        addFriend.friends.push({
          username: getCurrUser.username,
          status: "waiting",
        });
        await addFriend.save();
        return [{ msg: "You have sent a friend request!", success: true }];
      }
    }
    let msgHandle = [];
    await getCurrFriends.friends.forEach(async (element) => {
      if (
        element.username === reqData.username &&
        element.status === "pending"
      ) {
        msgHandle.push({
          msg: "You already sent a friend request to this person.",
          success: false,
        });
        return msgHandle;
      } else if (
        element.username === reqData.username &&
        element.status === "accept"
      ) {
        msgHandle.push({ msg: "You already friends.", success: false });
        return msgHandle;
      } else if (
        element.username === reqData.username &&
        element.status === "waiting"
      ) {
        msgHandle.push({
          msg: `${reqData.username} already sent you a friend request!`,
          success: false,
        });
        return msgHandle;
      }
    });
    if (msgHandle.length > 0) {
      return msgHandle;
    } else {
      let addFriend = await Friends.findOne({ username: token.username });
      addFriend.friends.push({
        username: reqData.username,
        status: "pending",
      });
      await addFriend.save();
      let checkIfFriendHasFriends = await Friends.findOne({
        username: checkIfFriendExists.username,
      });
      if (!checkIfFriendHasFriends) {
        let addFriendReq = new Friends({
          username: checkIfFriendExists.username,
          friends: [
            {
              username: getCurrUser.username,
              status: "waiting",
            },
          ],
        });
        await addFriendReq.save();
        msgHandle.push({
          msg: "You have sent a friend request!",
          success: true,
        });
        return msgHandle;
      } else {
        let addFriend = await Friends.findOne({
          username: checkIfFriendExists.username,
        });
        addFriend.friends.push({
          username: getCurrUser.username,
          status: "waiting",
        });
        await addFriend.save();
        msgHandle.push({
          msg: "You have sent a friend request!",
          success: true,
        });
        return msgHandle;
      }
    }
  } catch (err) {
    return [{ msg: "Please fill fields", success: false }];
  }
}

async function acceptFriend(token, reqData) {
  try {
    let getFriendUser = await User.findOne({ username: reqData.username });
    if (getFriendUser === null) {
      return [{ msg: "method is not allowed!", success: false }];
    }
    let getCurrUserFriends = await Friends.findOne({
      username: token.username,
    });
    let getFriendUserFriends = await Friends.findOne({
      username: reqData.username,
    });

    let checkIfRequestValid = getCurrUserFriends.friends.filter((item) => {
      return item.username === reqData.username;
    });
    if (checkIfRequestValid[0].status === "waiting") {
      let currUserNewFriendList = getCurrUserFriends.friends.map((item) => {
        if (item.username === reqData.username) {
          return { ...item, status: "accept" };
        }
        return item;
      });
      getCurrUserFriends.friends = currUserNewFriendList;
      await getCurrUserFriends.save();
      let friendNewFriendList = getFriendUserFriends.friends.map((item) => {
        if (item.username === token.username) {
          return { ...item, status: "accept" };
        }
        return item;
      });
      //checking members past for conversation
      const checkForPast = await pastCheck(token, reqData.username);
      if (checkForPast) {
        getFriendUserFriends.friends = friendNewFriendList;
        await getFriendUserFriends.save();
        return [{ msg: "Friend got accepted!", success: true }];
      } else {
        const newConversation = new Conversation({
          members: [token.username, reqData.username],
        });
        getFriendUserFriends.friends = friendNewFriendList;
        await newConversation.save();
        await getFriendUserFriends.save();
        return [{ msg: "Friend got accepted!", success: true }];
      }
    } else {
      return [{ msg: "method is not allowed!", success: false }];
    }
  } catch (err) {
    return [{ msg: "Please fill fields", success: false }];
  }
}

async function declineRequest(token, reqData) {
  try {
    if (reqData.username == undefined) {
      return [{ msg: "Must provide username", success: false }];
    }
    if (token.username === reqData.username) {
      return [{ msg: "You can't decline yourself!", success: false }];
    }
    let getFriendUser = await Friends.findOne({ username: reqData.username });
    if (!getFriendUser) {
      return [{ msg: "method is not allowed!", success: false }];
    }
    let checkIfRequestValid = getFriendUser.friends.filter((item) => {
      return item.username === token.username;
    });
    if (checkIfRequestValid[0].status === "pending") {
      let getCurrUser = await Friends.findOne({ username: token.username });
      let r_newFriendsList = getFriendUser.friends.filter((item) => {
        return item.username !== token.username;
      });
      getFriendUser.friends = r_newFriendsList;
      await getFriendUser.save();
      let newFriendsList = getCurrUser.friends.filter((item) => {
        return item.username !== reqData.username;
      });
      getCurrUser.friends = newFriendsList;
      await getCurrUser.save();
      return [{ msg: `You have declined ${reqData.username}!`, success: true }];
    } else {
      return [{ msg: "method is not allowed!", success: false }];
    }
  } catch (err) {
    return [{ msg: "method is not allowed!", success: false }];
  }
}
async function pendingRequest(token) {
  try {
    let getUserFriends = await Friends.findOne({ username: token.username });
    if (!getUserFriends) {
      return [{ msg: "You have no pending requests.", success: false }];
    }
    let getList = getUserFriends.friends.filter((item) => {
      return item.status === "waiting";
    });
    if (getList.length === 0) {
      return [{ msg: "You have no pending requests.", success: true }];
    }
    return [{ msg: getList, success: true }];
  } catch (err) {
    return [{ msg: "method is not allowed!", success: false }];
  }
}
module.exports = {
  getFriends,
  addFriend,
  acceptFriend,
  declineRequest,
  pendingRequest,
};
