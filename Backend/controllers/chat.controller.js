import { TryCatch } from '../middlewares/error.middleware.js';
import { Chat } from '../models/chat.model.js';
import { ErrorHandler } from "../utils/utility.js";
import { emitEvent } from '../utils/features.js';
import { ALERT, REFETCH_CHATS } from '../constants/events.js';

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



export {
    newGroupChat,
    getMyChats
}