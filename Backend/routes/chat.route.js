import express from 'express';
import { verfiyUser } from '../middlewares/auth.middleware.js';
import { multipleUpload } from '../middlewares/multer.middleware.js';
import { addMembers, deleteGroup, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, renameGroup, sendAttachements } from '../controllers/chat.controller.js';
import { addMemberValidator, chatIdValidator, deleteGroupValidator, getMessagesValidator, leaveGroupValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validateHandler } from '../lib/validator.js';

const app = express.Router();

app.use(verfiyUser);

app.post('/newGroup',newGroupValidator(), validateHandler,  newGroupChat);
app.get('/myChats', getMyChats);
app.get('/myGroups', getMyGroups);
app.put('/add',addMemberValidator(), validateHandler, addMembers);
app.delete('/remove',removeMemberValidator(), validateHandler,  removeMember);
app.put('/leave',leaveGroupValidator(), validateHandler,  leaveGroup);
app.post('/sendAttachement', multipleUpload, sendAttachmentsValidator(), validateHandler , sendAttachements);
app.get('/chatDetails/:chatId', chatIdValidator(), validateHandler,  getChatDetails);
app.put('/renameGroup/:chatId', renameValidator(), validateHandler,  renameGroup);
app.delete('/deleteGroup/:chatId', deleteGroupValidator(), validateHandler,  deleteGroup);
app.get('/getMessages/:chatId', getMessagesValidator(), validateHandler,  getMessages);

export default app;