import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './utils/features.js';
import cookieParser from 'cookie-parser';
// import { createUser } from './seeders/user.seeders.js';
import userRouter from './routes/user.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';



dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;
connectDB();
// createUser(10); // Uncomment this line to seed the database with 10 fake users

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use('/api/v1/user', userRouter);



app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});