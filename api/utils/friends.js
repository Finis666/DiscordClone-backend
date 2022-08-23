const Friends = require("../models/Friends");
const User = require("../models/User");
const { pastCheck } = require("./messages");
const Conversation = require("../models/Conversation");
async function getFriends(data) {
  try {
    let getCurrUserFriends = await Friends.findOne({
      userId: data.userId,
    });
    // checking for if friends exists
    if (getCurrUserFriends === null) {
      return [{ msg: "You have no friends :(", success: true }];
    } else {
      getCurrUserFriends = getCurrUserFriends.friends.filter((item) => {
        return item.status === "accept";
      });
      let friendList = [];
      for (let i = 0; i < getCurrUserFriends.length; i++) {
        let getUser = await User.findById(getCurrUserFriends[i].userId);
        friendList.push({
          userId: getCurrUserFriends[i].userId,
          username: getUser.username,
          image: getUser.image,
          active: false,
        });
      }
      return [{ msg: friendList, success: true }];
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
    let reqId = checkIfFriendExists._id.toHexString();
    if (token.userId === reqId) {
      return [{ msg: "You can't add yourself!", success: false }];
    }
    let getCurrFriends = await Friends.findOne({
      userId: token.userId,
    });
    if (!getCurrFriends) {
      let addFriendCurUser = new Friends({
        userId: token.userId,
        friends: [
          {
            userId: reqId,
            status: "pending",
          },
        ],
      });
      await addFriendCurUser.save();
      let checkIfFriendHasFriends = await Friends.findOne({
        userId: reqId,
      });
      if (!checkIfFriendHasFriends) {
        let addFriendReq = new Friends({
          userId: reqId,
          friends: [
            {
              userId: token.userId,
              status: "waiting",
            },
          ],
        });
        await addFriendReq.save();
        return [
          {
            msg: "You have sent a friend request!",
            friendId: reqId,
            success: true,
          },
        ];
      } else {
        let addFriend = await Friends.findOne({
          userId: reqId,
        });
        addFriend.friends.push({
          userId: token.userId,
          status: "waiting",
        });
        await addFriend.save();
        return [
          {
            msg: "You have sent a friend request!",
            friendId: reqId,
            success: true,
          },
        ];
      }
    }
    let msgHandle = [];
    await getCurrFriends.friends.forEach(async (element) => {
      if (element.userId === reqId && element.status === "pending") {
        msgHandle.push({
          msg: "You already sent a friend request to this person.",
          success: false,
        });
        return msgHandle;
      } else if (element.userId === reqId && element.status === "accept") {
        msgHandle.push({ msg: "You already friends.", success: false });
        return msgHandle;
      } else if (element.userId === reqId && element.status === "waiting") {
        msgHandle.push({
          msg: `${checkIfFriendExists.username} already sent you a friend request!`,
          success: false,
        });
        return msgHandle;
      }
    });
    if (msgHandle.length > 0) {
      return msgHandle;
    } else {
      let addFriend = await Friends.findOne({ userId: token.userId });
      addFriend.friends.push({
        userId: reqId,
        status: "pending",
      });
      await addFriend.save();
      let checkIfFriendHasFriends = await Friends.findOne({
        userId: reqId,
      });
      if (!checkIfFriendHasFriends) {
        let addFriendReq = new Friends({
          userId: reqId,
          friends: [
            {
              userId: token.userId,
              status: "waiting",
            },
          ],
        });
        await addFriendReq.save();
        msgHandle.push({
          msg: "You have sent a friend request!",
          friendId: reqId,
          success: true,
        });
        return msgHandle;
      } else {
        let addFriend = await Friends.findOne({
          userId: reqId,
        });
        addFriend.friends.push({
          userId: token.userId,
          status: "waiting",
        });
        await addFriend.save();
        msgHandle.push({
          msg: "You have sent a friend request!",
          friendId: reqId,
          success: true,
        });
        return msgHandle;
      }
    }
  } catch (err) {
    console.log(err);
    return [{ msg: "Please fill fields", success: false }];
  }
}

async function acceptFriend(token, reqData) {
  try {
    let getFriendUser = await User.findById(reqData.userId);
    if (getFriendUser === null) {
      return [{ msg: "method is not allowed!", success: false }];
    }
    let getCurrUserFriends = await Friends.findOne({
      userId: token.userId,
    });
    let getFriendUserFriends = await Friends.findOne({
      userId: reqData.userId,
    });

    let checkIfRequestValid = getCurrUserFriends.friends.filter((item) => {
      return item.userId === reqData.userId;
    });
    if (checkIfRequestValid[0].status === "waiting") {
      let currUserNewFriendList = getCurrUserFriends.friends.map((item) => {
        if (item.userId === reqData.userId) {
          return { ...item, status: "accept" };
        }
        return item;
      });
      getCurrUserFriends.friends = currUserNewFriendList;
      await getCurrUserFriends.save();
      let friendNewFriendList = getFriendUserFriends.friends.map((item) => {
        if (item.userId === token.userId) {
          return { ...item, status: "accept" };
        }
        return item;
      });
      //checking members past for conversation
      const checkForPast = await pastCheck(token, reqData.userId);
      if (checkForPast) {
        getFriendUserFriends.friends = friendNewFriendList;
        await getFriendUserFriends.save();
        return [{ msg: "Friend got accepted!", success: true }];
      } else {
        const newConversation = new Conversation({
          members: [token.userId, reqData.userId],
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
    console.log(err);
    return [{ msg: "Please fill fields", success: false }];
  }
}

async function declineRequest(token, reqData) {
  try {
    if (reqData.userId == undefined) {
      return [{ msg: "Must provide user id", success: false }];
    }
    if (token.userId === reqData.userId) {
      return [{ msg: "You can't decline yourself!", success: false }];
    }
    let getFriendUser = await Friends.findOne({ userId: reqData.userId });
    if (!getFriendUser) {
      return [{ msg: "method is not allowed!", success: false }];
    }
    let checkIfRequestValid = getFriendUser.friends.filter((item) => {
      return item.userId === token.userId;
    });
    if (checkIfRequestValid[0].status === "pending") {
      let getCurrUser = await Friends.findOne({ userId: token.userId });
      let r_newFriendsList = getFriendUser.friends.filter((item) => {
        return item.userId !== token.userId;
      });
      getFriendUser.friends = r_newFriendsList;
      await getFriendUser.save();
      let newFriendsList = getCurrUser.friends.filter((item) => {
        return item.userId !== reqData.userId;
      });
      getCurrUser.friends = newFriendsList;
      await getCurrUser.save();
      let getReqUser = await User.findById(reqData.userId);
      return [
        { msg: `You have declined ${getReqUser.username}!`, success: true },
      ];
    } else {
      return [{ msg: "method is not allowed!", success: false }];
    }
  } catch (err) {
    return [{ msg: "method is not allowed!", success: false }];
  }
}
async function pendingRequest(token) {
  try {
    let getUserFriends = await Friends.findOne({ userId: token.userId });
    if (!getUserFriends) {
      return [{ msg: "You have no pending requests.", success: false }];
    }
    let getList = getUserFriends.friends.filter((item) => {
      return item.status === "waiting";
    });
    if (getList.length === 0) {
      return [{ msg: "You have no pending requests.", success: true }];
    }
    let pendingList = [];
    for (let i = 0; i < getList.length; i++) {
      let getUser = await User.findById(getList[i].userId);
      pendingList.push({
        userId: getList[i].userId,
        username: getUser.username,
        image: getUser.image,
        status: "waiting",
      });
    }
    return [{ msg: pendingList, success: true }];
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
