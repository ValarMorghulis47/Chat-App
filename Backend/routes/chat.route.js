import express from 'express';
import { verfiyUser } from '../middlewares/auth.middleware.js';
import { addMembers, getMyChats, getMyGroups, newGroupChat } from '../controllers/chat.controller.js';

const app = express.Router();

app.use(verfiyUser);

app.post('/newGroup', newGroupChat);
app.get('/myChats', getMyChats);
app.get('/myGroups', getMyGroups);
app.put('/add', addMembers);


export default app;