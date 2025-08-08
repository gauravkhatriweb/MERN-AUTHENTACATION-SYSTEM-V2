import express from 'express';
import { getUserData } from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';

const userRouter = express.Router();

/**
 * User Routes
 * @description Defines all user-related endpoints
 */

// Protected routes (requires authentication)
userRouter.get('/get-user-data', userAuth, getUserData); // Changed to GET as it's retrieving data

export default userRouter;
