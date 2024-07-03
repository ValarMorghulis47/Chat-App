import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { connectDB } from './utils/features.js';
import cookieParser from 'cookie-parser';
// import { createUser } from './seeders/user.seeders.js';
import userRouter from './routes/user.route.js';
import chatRouter from './routes/chat.route.js';
import adminRouter from './routes/admin.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { Server } from 'socket.io';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from './constants/events.js';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuid } from 'uuid';
import { getSockets } from './lib/helper.js';
import { Message } from './models/message.model.js';
import { socketAuth } from './middlewares/auth.middleware.js';
// import { createMessagesInAChat, createSingleChats } from './seeders/chat.seeders.js';
const userSocketIDs = new Map();  // This will contain the socket id of the user and the user id


dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;
connectDB();
// createUser(10); // Uncomment this line to seed the database with 10 fake users
// createSingleChats(2); // Uncomment this line to seed the database with 1 single chats
// createMessagesInAChat("665c1599ab2bf0c6476b51bf", 50); // Uncomment this line to seed the database with 50 messages in a specific chat
// createMessagesInAChat("665b65f54ad0534542e524a0", 5);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});
app.set('io', io);
app.use(express.json());
app.use(cookieParser());


app.use('/api/v1/user', userRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/admin', adminRouter);

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, async (err) => await socketAuth(err, socket, next));
});

io.on('connection', (socket) => {

    const user = socket.user;
    userSocketIDs.set(user._id.toString(), socket.id);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name,
                avatar_url: user.avatar_url,
            },
            chat: chatId,
            createdAt: new Date().toISOString(),
        };

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
        };

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime,
        });
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });
        try {
            await Message.create(messageForDB);
        } catch (error) {
            throw new Error(error);
        }
    });


    socket.on('disconnect', () => {
        userSocketIDs.delete(user._id.toString());
        console.log('user disconnected', socket.id);
    });
});


app.use(errorMiddleware);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export {
    userSocketIDs
};