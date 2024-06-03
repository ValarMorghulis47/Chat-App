import { TryCatch } from '../middlewares/error.middleware.js';
import { Chat } from '../models/chat.model.js';
import { ErrorHandler } from "../utils/utility.js";
import { emitEvent } from '../utils/features.js';
import { ALERT, REFETCH_CHATS } from '../constants/events.js';
import { User } from '../models/user.model.js';

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
            $match: { members: req.user._id }
        },
        {
            $lookup: {
                from: "users",
                localField: "members",
                foreignField: "_id",
                as: "members",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar_url: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                groupChat: 1,
                avatar: {
                    $cond: {
                        if: "$groupChat",
                        then: { $slice: ["$members.avatar_url", 3] },
                        else: { $arrayElemAt: ["$members.avatar_url", 0] }
                    }
                },
                name: {
                    $cond: {
                        if: "$groupChat",
                        then: "$name",
                        else: { $arrayElemAt: ["$members.username", 0] }
                    }
                },
                members: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$members",
                                as: "member",
                                cond: { $ne: ["$$member._id", req.user._id] }
                            }
                        },
                        as: "member",
                        in: "$$member._id"
                    }
                }
            }
        }
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
    if (chat.members.length > 50)
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


export {
    newGroupChat,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMember
}