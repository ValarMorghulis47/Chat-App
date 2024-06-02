import express from 'express';
import { verfiyUser } from '../middlewares/auth.middleware.js';
import { getMyChats, newGroupChat } from '../controllers/chat.controller.js';

const app = express.Router();

app.use(verfiyUser);

app.post('/newGroup', newGroupChat);
app.get('/myChats', getMyChats);


export default app;