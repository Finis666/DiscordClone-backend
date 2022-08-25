const User = require("../models/User");
async function getUsersPagination(page) {
  const ITEMS_PER_PAGE = 10;
  const currPage = page || 1;
  const query = { isDeleted: false };
  try {
    const skip = (currPage - 1) * ITEMS_PER_PAGE;

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .limit(ITEMS_PER_PAGE)
      .skip(skip)
      .select(["-password"]);

    const usersList = users.filter((user) => {
      return user.isDeleted !== true;
    });

    const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

    return [
      {
        msg: {
          pagination: {
            count,
            pageCount,
          },
          users: usersList,
        },
      },
    ];
  } catch (err) {
    return [{ msg: "Somthing went wrong, try again later.", success: false }];
  }
}

async function banUser(userId, token) {
  if (token.userId === userId) {
    return [{ msg: "You cann't ban yourself!" }];
  }
  if (!userId) {
    return [{ msg: "Missing fields", success: false }];
  }
  try {
    const findUser = await User.findByIdAndUpdate(userId, {
      isDeleted: true,
    });

    if (findUser && findUser.isAdmin) {
      return [{ msg: "You cann't ban other admins!", success: false }];
    }
    await findUser.save();
    return [{ msg: "User banned successfully.", success: true }];
  } catch (err) {
    return [{ msg: "Somthing went wrong, try again later.", success: false }];
  }
}

async function editUser(data, token) {
  if (data.length === 0) {
    return [{ msg: "Missing fields", success: false }];
  }
  if (typeof data.isAdmin !== "boolean") {
    return [{ msg: "Invalid params", success: false }];
  }
  if (data.username.length < 2 || data.username.length > 15) {
    return [{ msg: "Must be between 2 and 15 in length", success: false }];
  }
  try {
    const validateUsername = await User.findOne({ username: data.username });
    if (validateUsername) {
      if (
        validateUsername.username === data.username &&
        validateUsername._id.toHexString() !== data._id
      ) {
        return [
          { msg: "Username is taken try somthing else!", success: false },
        ];
      }
    }
    if (data._id === token.userId) {
      const findUser = await User.findByIdAndUpdate(data._id, {
        username: data.username,
      });
      await findUser.save();
      return [{ msg: "User updated successfully.", success: true }];
    } else {
      const findUser = await User.findByIdAndUpdate(data._id, {
        username: data.username,
        isAdmin: data.isAdmin,
      });
      await findUser.save();
      return [{ msg: "User updated successfully.", success: true }];
    }
  } catch (err) {
    return [{ msg: "Somthing went wrong, try again later", success: false }];
  }
}

module.exports = { getUsersPagination, banUser, editUser };
