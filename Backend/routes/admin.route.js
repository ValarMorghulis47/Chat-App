import express from 'express';
import { adminLogin, adminLogout, checkAdmin, getAllChats, getAllMessages, getAllUsers, getDashboardStats } from '../controllers/admin.controller.js';
import { adminOnly } from '../middlewares/auth.middleware.js';


const app = express.Router();

app.post('/adminLogin', adminLogin);
app.get('/adminLogout', adminLogout);

app.use(adminOnly);

app.get('/checkAdmin', checkAdmin);
app.get('/getUsers', getAllUsers);
app.get('/getChats', getAllChats);
app.get('/getMessages', getAllMessages);
app.get('/getDashboard', getDashboardStats);

export default app;