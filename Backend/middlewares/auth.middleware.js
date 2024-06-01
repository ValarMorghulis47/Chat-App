import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { TryCatch } from './error.middleware.js';
import { ErrorHandler } from '../utils/utility.js';

const verfiyUser = TryCatch(async (req, res, next) => {
    /* 
    {
        'JWT-Token': 'abc'
    }
        The output is like this so tha's why we wrote it like req.cookies["JWT-Token"] because it a json object and it was simple then we would just use '.' operator
    */
    const token = req.cookies["JWT-Token"];
    if (!token) return next(new ErrorHandler('Access Denied', 401));
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    req.user = user;
    next();
});

export { verfiyUser };