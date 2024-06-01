import { TryCatch } from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js"
import { ErrorHandler } from "../utils/utility.js";


const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.generateToken();
    } catch (error) {
        throw new Error(error.message);
    }
}

const registerUser = TryCatch(async (req, res, next) => {
    const { email, username, password, bio } = req.body;
    //Check if the username or email is already in use
    const user = await User.create({ email, username, password, bio, avatar_url: 'abc', avatar_public_id: 'xyz' });
    if (!user) return next(new ErrorHandler('User not created', 404));
    return res.status(201).json({ success: true, message: "Account Created Successfully", user });
})

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
})

const logoutUser = TryCatch(async (req, res, next) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    return res.status(200).clearCookie("JWT-Token", options).json
        ({ success: true, message: "Logged Out Successfully" })
})

const getMyProfile = TryCatch(async (req, res, next)=>{
    return res.status(200)
    .json({success: true, message: "Profile Fetched Successfully", user: req.user});
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getMyProfile
}