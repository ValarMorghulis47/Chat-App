import { TryCatch } from "../middlewares/error.middleware.js";
import {User} from "../models/user.model.js"
import { ErrorHandler } from "../utils/utility.js";


const generateToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        return user.generateToken();
    } catch (error) {
        throw new Error(error.message);
    }
}

const registerUser = TryCatch(async(req,res,next)=>{
    console.log(req.body);
    const {email, username, password, bio} = req.body;
    const user = await User.create({email, username, password, bio, avatar_url: 'abc', avatar_public_id: 'xyz'});
    if(!user) return next(new ErrorHandler('User not created', 404));
    return res.status(201).json({success: true, user});
})

export {
    registerUser,
}