import { TryCatch } from "../middlewares/error.middleware.js";
import { Chat } from "../models/chat.model.js";
import { Request } from "../models/request.model.js";
import { User } from "../models/user.model.js"
import { ErrorHandler } from "../utils/utility.js";
import { emitEvent } from "../utils/features.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";


const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.generateToken();
    } catch (error) {
        throw new Error(error.message);
    }
};

const registerUser = TryCatch(async (req, res, next) => {
    const { email, username, password, bio } = req.body;
    //Check if the username or email is already in use
    const user = await User.create({ email, username, password, bio, avatar_url: 'abc', avatar_public_id: 'xyz' });
    if (!user) return next(new ErrorHandler('User not created', 404));
    return res.status(201).json({ success: true, message: "Account Created Successfully", user });
});

const loginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new ErrorHandler('Invalid Email', 404));

    const CorrectPassword = await user.isPasswordCorrect(password);
    if (!CorrectPassword) return next(new ErrorHandler('Invalid Password', 401));
    const Token = await generateToken(user._id);
    const options = {
        sameSite: 'None',
        secure: true,
        httpOnly: true
    }
    return res.status(200).cookie("JWT-Token", Token, options)
        .json({ success: true, message: "Login Successful", user });
});

const logoutUser = TryCatch(async (req, res, next) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    return res.status(200).clearCookie("JWT-Token", options).json
        ({ success: true, message: "Logged Out Successfully" })
});

const getMyProfile = TryCatch(async (req, res, next) => {
    return res.status(200)
        .json({ success: true, message: "Profile Fetched Successfully", user: req.user });
});

const searchUser = TryCatch(async (req, res, next) => {
    let { username = "" } = req.query;
    username = username.replace(/['"]/g, ""); // Remove any quotes
    const myChats = await Chat.find({ groupChat: false, members: req.user._id });
    const allMembersIds = myChats.flatMap((chat) => chat.members);  // flatMap is used to flatten the array of arrays into a single array  

    const user = await User.find({
        _id: { $nin: allMembersIds },
        username: { $regex: username, $options: "i" }
    }).select("username avatar_url");

    return res.status(200)
        .json({
            success: true,
            message: "Users Fetched Successfully",
            users: user
        });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
    const { receiverId } = req.body;

    const request = await Request.findOne({
        $or: [
            { sender: req.user._id, receiver: receiverId },
            { sender: receiverId, receiver: req.user._id }
        ]
    });

    if (request)
        return next(new ErrorHandler("Request already sent", 400));
    if (req.user._id.toString() === receiverId)
        return next(new ErrorHandler("You cannot send request to yourself", 400));

    const newRequest = await Request.create({
        sender: req.user._id,
        receiver: receiverId
    });
    if (!newRequest)
        return next(new ErrorHandler("Request not sent", 400));

    emitEvent(req, NEW_REQUEST, [receiverId]);

    return res.status(200).
        json({
            success: true,
            message: "Request Sent Successfully",
            request: newRequest
        })
});

const acceptRejectRequest = TryCatch(async (req, res, next) => {
    const { requestId, accpet } = req.body;  // acction will be either accept or reject or true or false and it will come from the button click

    const request = await Request.findById(requestId).populate("sender", "username avatar_url").populate("receiver", "username avatar_url");
    if (!request)
        return next(new ErrorHandler("Request not found", 404));
    if (request.receiver._id.toString() !== req.user._id.toString())
        return next(new ErrorHandler("You are not authorized to perform this action", 401));

    if (accpet) {
        const members = [request.sender._id, request.receiver._id];
        await Promise.all([
            Chat.create({
                members,
                name: request.sender.username
            }),
            request.deleteOne()
        ]);

        emitEvent(req, REFETCH_CHATS, members);

        return res.status(200)
            .json({
                success: true,
                message: "Friend Request Accepted Successfully",
                senderId: request.sender._id,
            });
    }

    await request.deleteOne();
    return res.status(200)
        .json({
            success: true,
            message: "Friend Request Rejected Successfully",
        });

});

const getNotifications = TryCatch(async (req, res, next) => {
    const requests = await Request.find({ receiver: req.user._id }).populate("sender", "username avatar_url");
    return res.status(200)
        .json({
            success: true,
            message: "Notifications Fetched Successfully",
            requests
        });
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getMyProfile,
    searchUser,
    sendFriendRequest,
    acceptRejectRequest,
    getNotifications
}