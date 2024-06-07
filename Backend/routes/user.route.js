import express from 'express';
import { acceptRejectRequest, getMyFriends, getMyProfile, getNotifications, loginUser, logoutUser, registerUser, searchUser, sendFriendRequest } from '../controllers/user.controller.js';
import { verfiyUser } from '../middlewares/auth.middleware.js';
import { singleUpload } from '../middlewares/multer.middleware.js';

const app = express.Router();

app.post('/register', singleUpload ,registerUser);
app.post('/login', loginUser);

//After This middleware all the routes will be protected
app.use(verfiyUser);

app.get('/logout', logoutUser);
app.get('/profile', getMyProfile);
app.get('/search', searchUser);
app.put('/sendFriend', sendFriendRequest);
app.put('/acceptRejectFriend', acceptRejectRequest);
app.get('/notifications', getNotifications);
app.get('/allFriends', getMyFriends);



export default app;


