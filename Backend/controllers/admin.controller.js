import jwt from "jsonwebtoken";
import { TryCatch } from "../middlewares/error.middleware.js";
import { ErrorHandler } from "../utils/utility.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === process.env.ADMIN_SECRET_KEY;

  if (!isMatched) return next(new ErrorHandler("Invalid Admin Key", 401));

  const token = jwt.sign({ secretKey: secretKey }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const options = {
    sameSite: 'None',
    secure: true,
    httpOnly: true,
    // Expires: 1000 * 60 * 15
  }

  return res
    .status(200)
    .cookie("JWT-Admin-Token", token, options)
    .json({
      success: true,
      message: "Authenticated Successfully, Welcome BOSS",
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  }
  return res.status(200).clearCookie("JWT-Admin-Token", options).json
    ({ success: true, message: "Logged Out Successfully" })
});

const checkAdmin = TryCatch(async (req, res, next) => {
  return res.status(200)
    .json({
      success: true,
      message: "Admin Authenticated"
    });
})

const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find();
  const completeUsers = await Promise.all(users.map(async (user) => {
    const [totalFriends, totalGroups] = await Promise.all([
      Chat.countDocuments({ groupChat: false, members: user._id }),
      Chat.countDocuments({ groupChat: true, members: user._id })
    ])
    return {
      user,
      totalFriends,
      totalGroups
    }
  }))

  return res.status(200)
    .json({
      success: true,
      data: completeUsers
    });
});

const getAllChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.aggregate([
    {
      $match: {},
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "MemberDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar_url: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "CreatorData",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar_url: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "chat",
        as: "TotalMessages",
      },
    },
    {
      $addFields: {
        TotalMessages: { $size: "$TotalMessages" },
        CreatorDetails: {
          $cond: {
            if: { $eq: ["$groupChat", true] },
            then: { $arrayElemAt: ["$CreatorData", 0] },
            else: {}
          }
        },
        TotalMembers: { $size: "$MemberDetails" }
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        groupChat: 1,
        TotalMessages: 1,
        CreatorDetails: 1,
        MemberDetails: 1,
        avatars: {
          $slice: ["$MemberDetails.avatar_url", 3]
        },
        TotalMembers: 1
      }
    }
  ]);

  return res.status(200)
    .json({
      success: true,
      data: chats
    });

  // const chats = await Chat.find({})
  //   .populate("members", "username avatar_url")
  //   .populate("creator", "username avatar_url");

  // const transformedChats = await Promise.all(
  //   chats.map(async ({ members, _id, groupChat, username, creator }) => {
  //     const totalMessages = await Message.countDocuments({ chat: _id });

  //     return {
  //       _id,
  //       groupChat,
  //       username,
  //       avatar: members.slice(0, 3).map((member) => member.avatar_url),
  //       members,
  //       creator: {
  //         username: creator?.username || "None",
  //         avatar_url: creator?.avatar_url || "",
  //       },
  //       totalMembers: members.length,
  //       totalMessages,
  //     };
  //   })
  // );

  // return res.status(200).json({
  //   status: "success",
  //   chats: transformedChats,
  // });
});

const getAllMessages = TryCatch(async (req, res, next) => {
  const messages = await Message.aggregate([
    {
      $match: {},
    },
    {
      $lookup: {
        from: "chats",
        localField: "chat",
        foreignField: "_id",
        as: "Details",
        pipeline: [
          {
            $project: {
              groupChat: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "details",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar_url: 1
            },
          },
        ],
      },
    },
    {
      $addFields: {
        ChatDetails: {
          $arrayElemAt: ["$Details", 0]
        },
        SenderDetails: {
          $arrayElemAt: ["$details", 0]
        },
        Attachments: "$attachments"
      }
    },
    {
      $project: {
        _id: 1,
        Attachments: 1,
        content: 1,
        createdAt: 1,
        ChatDetails: 1,
        SenderDetails: 1
      }
    }
  ]);

  return res.status(200)
    .json({
      success: true,
      data: messages
    });

});

const getDashboardStats = TryCatch(async (req, res, next) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

  const today = new Date();

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: {
      $gte: last7Days,
      $lte: today,
    },
  }).select("createdAt");
  const messages = new Array(7).fill(0);
  const dayInMiliseconds = 1000 * 60 * 60 * 24;

  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
    const index = Math.floor(indexApprox);
    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };

  return res.status(200).json({
    success: true,
    data: stats,
  });
});

export {
  adminLogin,
  adminLogout,
  checkAdmin,
  getAllUsers,
  getAllChats,
  getAllMessages,
  getDashboardStats
}