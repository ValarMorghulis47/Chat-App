import express from 'express';
import { getMyProfile, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import { verfiyUser } from '../middlewares/auth.middleware.js';

const app = express.Router();

app.post('/register', registerUser);
app.post('/login', loginUser);

//After This middleware all the routes will be protected
app.use(verfiyUser);

app.get('/logout', logoutUser);
app.get('/profile', getMyProfile)

export default app;

