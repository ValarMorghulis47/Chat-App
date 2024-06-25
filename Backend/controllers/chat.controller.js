import { TryCatch } from '../middlewares/error.middleware.js';
import { Chat } from '../models/chat.model.js';
import { ErrorHandler } from "../utils/utility.js";
import { UploadFilesCloudinary, emitEvent } from '../utils/features.js';
import { ALERT, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from '../constants/events.js';
import { User } from '../models/user.model.js';
import { Message } from '../models/message.model.js';

const newGroupChat = TryCatch(async (req, res, next) => {
    const { name, members } = req.body;
    if (members.length < 2) return next(new ErrorHandler('Group must have at least 2 members', 400));
    const allmembers = [...members, req.user._id];
    const group = await Chat.create({
        name,
        groupChat: true,
        creator: req.user._id,
        members: allmembers
    })
    if (!group) return next(new ErrorHandler('Group could not be created', 400));

    emitEvent(req, ALERT, allmembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return res.status(201)
        .json({
            sucess: true,
            message: "Group Created Suceesfully",
            data: group
        })
})

// const getMyChats = TryCatch(async (req, res, next) => {
//     const chats = await Chat.find({ members: req.user }).populate(
//         "members",
//         "username avatar_url avatar_public_id"
//     );
//     // console.log(chats[0].members[0]);
//     const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
//         const otherMembers = members.filter(member => member._id.toString() !== req.user._id.toString());
//         return {
//             _id,
//             groupChat,
//             avatar: groupChat ? members.slice(0, 3).map(member => member.avatar_url) : otherMembers[0].avatar_url, //will check when the frontend is built
//             name: groupChat ? name : otherMembers[0].username,
//             members: members.filter(member => member._id.toString() !== req.user._id.toString()).map(singleMember=> singleMember._id)
//         }
//     })
//     return res.status(200)
//         .json({
//             success: true,
//             message: "Chats Fetched Successfully",
//             data: transformedChats
//         })
// })
const getMyChats = TryCatch(async (req, res, next) => {
    const chats = await Chat.aggregate([
        {
            $match: {
                members: req.user._id
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "members",
                foreignField: "_id",
                as: "Details",
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
            $project: {
                _id: 1,
                groupChat: 1,
                avatar: {
                    $cond: {
                        if: "$groupChat",
                        then: {
                            $slice: ["$Details.avatar_url", 3],
                        },
                        else: {
                            $filter: {
                                input: "$Details.avatar_url",
                                as: "individualAvatar",
                                cond: {
                                    $ne: ["$$individualAvatar", req.user.avatar_url]
                                }
                            }
                        },
                    },
                },
                members: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$members",
                                as: "memberid",
                                cond: {
                                    $ne: ["$$memberid", req.user._id]
                                }
                            }
                        },
                        as: "memberid",
                        in: "$$memberid"
                    },
                },
                name: {
                    $cond: {
                        if: "$groupChat",
                        then: "$name",
                        else: {
                            $arrayElemAt: ["$Details.username", 0]
                        }
                    }
                }
            },
        },
    ]);
    return res.status(200)
        .json({
            success: true,
            message: "Chats Fetched Successfully",
            data: chats
        })
});

const getMyGroups = TryCatch(async (req, res, next) => {
    const Groups = await Chat.aggregate(
        [
            {
                $match: {
                    creator: req.user._id,
                    members: req.user._id,
                    groupChat: true
                }
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
                                avatar_url: 1
                            }
                        }
                    ],
                }
            },
            {
                $project: {
                    _id: 1,
                    groupChat: 1,
                    name: 1,
                    avatar: {
                        $slice: ["$MemberDetails.avatar_url", 3]
                    }
                }
            }
        ]
    )
    return res.status(200)
        .json({
            success: true,
            message: "Groups Fetched Successfully",
            data: Groups
        })
})

const addMembers = TryCatch(async (req, res, next) => {
    const { members, chatId } = req.body;
    if (members.length < 1)
        return next(new ErrorHandler('Please provide members', 400));
    const chat = await Chat.findById(chatId);
    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));
    if (chat.creator.toString() !== req.user._id.toString())
        return next(new ErrorHandler('You are not authorized to add members', 403));

    // we have to check if the user is already in the group
    const ExistMember = members.some(member => chat.members.includes(member));
    if (ExistMember)
        return next(new ErrorHandler('Member already in the group', 400));
    if (chat.members.length > 100)
        return next(new ErrorHandler('Group members limit reached', 400));


    const newMembers = members.map((member_id) => User.findById(member_id, "username"));
    const AllMembers = await Promise.all(newMembers);
    chat.members.push(...AllMembers);
    await chat.save();
    const newMembersName = AllMembers.map(member => member.username).join(', ');
    emitEvent(req, ALERT, chat.members, `${newMembersName} was added to the group`);
    emitEvent(req, REFETCH_CHATS, chat.members);
    return res.status(200)
        .json({
            success: true,
            message: `${newMembersName} was added to the group`,
            data: chat
        })
})

const removeMember = TryCatch(async (req, res, next) => {
    const { chatId, userId } = req.body;
    const [chat, userThatWillBeRemoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId, "username")
    ]);

    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));
    if (!userThatWillBeRemoved)
        return next(new ErrorHandler('User not found', 404));
    if (chat.creator.toString() !== req.user._id.toString())
        return next(new ErrorHandler('You are not authorized to remove members', 403));
    if (chat.creator.toString() === userId)
        return next(new ErrorHandler('You cannot remove yourself', 400));
    if (!chat.members.includes(userId))
        return next(new ErrorHandler('User not in the group', 400));
    if (chat.members.length < 3)
        return next(new ErrorHandler('Group must have at least 2 members', 400));
    const allMembers = chat.members.map(member => member.toString());   //Getting all the id's of the members because later we will fetch chats for all members
    chat.members = chat.members.filter(member => member.toString() !== userId);
    await chat.save();

    emitEvent(req, ALERT, chat.members, { message: `${userThatWillBeRemoved.username} was removed from the group`, chatId });
    emitEvent(req, REFETCH_CHATS, allMembers);
    return res.status(200)
        .json({
            success: true,
            message: `${userThatWillBeRemoved.username} was removed from the group`,
            data: chat
        })
});

const leaveGroup = TryCatch(async (req, res, next) => {
    const { chatId } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));
    if (!chat.members.includes(req.user._id))
        return next(new ErrorHandler('You are not in the group', 400));
    if (chat.members.length < 3)
        return next(new ErrorHandler('Group must have at least 2 members', 400));

    const remainingMembers = chat.members.filter(memberId => memberId.toString() !== req.user._id.toString());
    if (chat.creator.toString() === req.user._id.toString()) {
        const randomNumber = Math.floor(Math.random() * remainingMembers.length);
        chat.creator = remainingMembers[randomNumber];
    }

    chat.members = remainingMembers;
    await chat.save();

    const user = await User.findById(req.user._id, "username");
    emitEvent(req, ALERT, chat.members, { message: `${user.username} has left the group`, chatId });

    return res.status(200)
        .json({
            success: true,
            message: `${user.username} has left the group`,
            data: chat
        })
});

const sendAttachements = TryCatch(async (req, res, next) => {
    const { chatId } = req.body;
    console.log(req.files);

    const [chat, user] = await Promise.all([
        Chat.findById(chatId),
        User.findById(req.user._id)
    ])

    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));
    if (!req.files || req.files.length === 0)
        return next(new ErrorHandler('Please provide attachments', 400));
    if (req.files.length > 5)
        return next(new ErrorHandler('You can send up to 5 attachments', 400));

    const files = req.files || [];
    // Files will be uploaded to clodinary
    const attachments = [];     // will use uploadFilesCloudinary function to upload files to cloudinary

    const message = await Message.create({
        content: "",
        attachments,
        sender: user._id,
        chat: chatId
    });
    if (!message)
        return next(new ErrorHandler('Message could not be sent', 400));

    const messageForRealTime = {
        content: '',
        attachments,
        sender: {
            _id: user._id,
            username: user.username,
            avatar_url: user.avatar_url
        },
        chat: chatId,
    }
    emitEvent(req, NEW_MESSAGE, chat.members, {
        message: messageForRealTime,
        chatId
    });
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res.status(200).json({
        succes: true,
        message: "Attachments sent successfully",
        data: message
    });

});

const getChatDetails = TryCatch(async (req, res, next) => {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId).populate('members', 'username avatar_url');
    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));

    return res.status(200).json({
        success: true,
        message: "Chat details fetched successfully",
        data: chat
    });
});

const renameGroup = TryCatch(async (req, res, next) => {
    const { chatId } = req.params;
    const { name } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));
    if (chat.creator.toString() !== req.user._id.toString())
        return next(new ErrorHandler('You are not authorized to rename the group', 403));
    if (!name)
        return next(new ErrorHandler('Please provide a name', 400));

    chat.name = name;
    await chat.save();

    emitEvent(req, ALERT, chat.members, `Group name changed to ${name}`);
    emitEvent(req, REFETCH_CHATS, chat.members)

    return res.status(200).json({
        success: true,
        message: "Group name changed successfully",
        data: chat
    });
});

const deleteGroup = TryCatch(async (req, res, next) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat)
        return next(new ErrorHandler('Chat not found', 404));
    if (chat.creator.toString() !== req.user._id.toString())
        return next(new ErrorHandler('You are not authorized to delete the group', 403));

    const memmbers = chat.members;

    const messagesWithAttachements = await Message.find({
        chat: chatId,
        attachments: { $ne: [] }
    });
    const public_ids = [];
    messagesWithAttachements.forEach(message => {       // we didn't used map because then we would have to return something
        message.attachments.forEach(avatar =>{
            public_ids.push(avatar.public_id);
        })
    });

    await Promise.all([
        // deleteFilesCloudinary(public_ids),  // we will make this function later
        chat.deleteOne(),
        Message.deleteMany({ chat: chatId })
    ])

    emitEvent(req, REFETCH_CHATS, memmbers); // didn't used chat.members because chat is already deleted and didn't need to notify the members

    return res.status(200).json({
        success: true,
        message: "Group deleted successfully"
    });
});

const getMessages = TryCatch(async (req, res, next) => {
    const { chatId } = req.params;
    const { page = 1 } = req.query;
  
    const resultPerPage = 20;
    const skip = (page - 1) * resultPerPage;
  
    const chat = await Chat.findById(chatId);
  
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
  
    if (!chat.members.includes(req.user._id.toString()))
      return next(
        new ErrorHandler("You are not allowed to access this chat", 403)
      );
  
    const [messages, totalMessagesCount] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resultPerPage)
        .populate("sender", "name avatar_url")
        .lean(),
      Message.countDocuments({ chat: chatId }),
    ]);
  
    const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;
  
    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
      totalPages,
    });
});

export {
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMember,
    leaveGroup,
    sendAttachements,
    getChatDetails,
    renameGroup,
    deleteGroup,
    getMessages
}