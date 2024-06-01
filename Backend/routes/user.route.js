import express from 'express';
import { registerUser } from '../controllers/user.controller.js';

const app = express.Router();

app.post('/register', registerUser);

export default app;


