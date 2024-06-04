import express from 'express';
import { verfiyUser } from '../middlewares/auth.middleware.js';
import { multipleUpload } from '../middlewares/multer.middleware.js';
import { addMembers, deleteGroup, getChatDetails, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, renameGroup, sendAttachements } from '../controllers/chat.controller.js';

const app = express.Router();

app.use(verfiyUser);

app.post('/newGroup', newGroupChat);
app.get('/myChats', getMyChats);
app.get('/myGroups', getMyGroups);
app.put('/add', addMembers);
app.delete('/remove', removeMember);
app.put('/leave', leaveGroup);
app.post('/sendAttachement', multipleUpload , sendAttachements);
app.get('/chatDetails/:chatId', getChatDetails);
app.put('/renameGroup/:chatId', renameGroup);
app.delete('/deleteGroup/:chatId', deleteGroup);


export default app;