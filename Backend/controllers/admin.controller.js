import jwt from "jsonwebtoken";
import { TryCatch } from "../middlewares/error.middleware.js";
import { ErrorHandler } from "../utils/utility.js";



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


export {
    adminLogin,
    adminLogout,
    checkAdmin
}