import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'

import { getUserMailFromToken } from './middleware/authMiddleware.js';

import userRoutes from './routes/userRoutes.js'

import authRoutes from './routes/authRoutes.js'

const app = express();
const port = process.env.PORT

mongoose.connect(process.env.DB_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.use(express.json())

app.use('/auth',authRoutes)

app.use(getUserMailFromToken)

//routes

app.use('/user',userRoutes)

app.listen(port, async () => {
    console.log(`Server listening on port ${port}`);
});
