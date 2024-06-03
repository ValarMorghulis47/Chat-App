import express from 'express';
import { verfiyUser } from '../middlewares/auth.middleware.js';
import { addMembers, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember } from '../controllers/chat.controller.js';

const app = express.Router();

app.use(verfiyUser);

app.post('/newGroup', newGroupChat);
app.get('/myChats', getMyChats);
app.get('/myGroups', getMyGroups);
app.put('/add', addMembers);
app.delete('/remove', removeMember);
app.put('/leave', leaveGroup);

export default app;