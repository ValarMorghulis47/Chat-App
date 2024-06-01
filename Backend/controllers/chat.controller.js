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

    emitEvent(req, ALERT, allmembers ,`Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return res.status(201)
        .json({
            sucess: true,
            message: "Group Created Suceesfully",
            data: group
        })
})



export {
    newGroupChat
}