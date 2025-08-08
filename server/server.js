// Import required packages
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

// Import local modules
import connectDB from './config/mongoDB.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoute.js';

// Initialize express application
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB database
connectDB(); 

// Middleware Setup
app.use(express.json()); // Parse JSON request bodies
app.use(cors({credentials: true})); // Enable CORS with credentials
app.use(cookieParser()); // Parse Cookie header and populate req.cookies

// Health check endpoint
app.get('/', (req, res) => {
  res.send('API WORKING!');
});

// Route Handlers
app.use('/api/auth', authRouter); // Authentication routes
app.use('/api/user', userRouter); // User management routes

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
