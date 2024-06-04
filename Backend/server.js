import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './utils/features.js';
import cookieParser from 'cookie-parser';
// import { createUser } from './seeders/user.seeders.js';
import userRouter from './routes/user.route.js';
import chatRouter from './routes/chat.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
// import { createMessagesInAChat, createSingleChats } from './seeders/chat.seeders.js';



dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;
connectDB();
// createUser(10); // Uncomment this line to seed the database with 10 fake users
// createSingleChats(2); // Uncomment this line to seed the database with 1 single chats
// createMessagesInAChat("665c1599ab2bf0c6476b51bf", 50); // Uncomment this line to seed the database with 50 messages in a specific chat
// createMessagesInAChat("665b65f54ad0534542e524a0", 5);

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use('/api/v1/user', userRouter);
app.use('/api/v1/chat', chatRouter);



app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});