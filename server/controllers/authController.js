import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import dotenv from 'dotenv';
import sendEmail from '../config/emailService.js';

// Load environment variables
dotenv.config();

// Constants
const JWT_EXPIRY = '7d';
const PASSWORD_MIN_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const COOKIE_OPTIONS = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production'
};

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and set JWT token in cookie
 * @param {Object} user - User object containing email and _id
 * @param {Object} res - Express response object
 * @returns {string} JWT token
 */
const createAndSetToken = (user, res) => {
    const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
    res.cookie('token', token, COOKIE_OPTIONS);
    return token;
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Validate password length
        if (password.length < PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
            });
        }

        // Create new user
        const user = await UserModel.create({
            name,
            email,
            password: await bcrypt.hash(password, 10)
        });

        // Generate and set token
        createAndSetToken(user, res);

        // Send welcome email
        await sendEmail(
            user.email,
            'Registration Successful',
            `Welcome to MERN Authentication System, ${user.name}! Your registration was successful.`
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { email: user.email }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
}

/**
 * User login
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate and set token
        createAndSetToken(user, res);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                email: user.email,
                name: user.name,
                isVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
}

/**
 * User logout
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No active session found'
            });
        }

        // Clear the authentication cookie
        res.clearCookie('token', {
            ...COOKIE_OPTIONS,
            maxAge: 0
        });

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
}

/**
 * Send verification OTP to user's email
 * @route POST /api/auth/send-verification-otp
 * @protected
 */
export const sendVerificationOtp = async (req, res) => {
    try {
        // Find user by ID (set by auth middleware)
        const user = await UserModel.findOne({ _id: req.userId });    
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        user.verifyOtp = otp;
        user.verifyOtpExpiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

        // Send OTP via email
        await sendEmail(
            user.email,
            'Account Verification OTP',
            `Your verification OTP is ${otp}. This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.`
        );

        return res.status(200).json({
            success: true,
            message: 'Verification OTP sent successfully'
        });
    } catch (error) {
        console.error('Send Verification OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending verification OTP'
        });
    }
}

/**
 * Verify user's account using OTP
 * @route POST /api/auth/verify-otp
 * @protected
 */
export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        // Validate OTP input
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        // Find user by ID (set by auth middleware)
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        if (user.verifyOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiry
        if (user.verifyOtpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Update user verification status
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.isAccountVerified = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while verifying OTP'
        });
    }
}

/**
 * Check if user is authenticated
 * @route POST /api/auth/is-authenticated
 * @protected
 */
export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'User is authenticated'
        });
    } catch (error) {
        console.error('Authentication Check Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while checking authentication'
        });
    }
}

/**
 * Send password reset OTP
 * @route POST /api/auth/send-reset-password-otp
 */
export const sendRestPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user and verify account status
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        if (!user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account is not verified. Please verify your account first'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        user.forgotPasswordOtp = otp;
        user.forgotPasswordOtpExpiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

        // Send OTP via email
        await sendEmail(
            user.email,
            'Password Reset OTP',
            `Your password reset OTP is ${otp}. This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.`
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully'
        });
    } catch (error) {
        console.error('Send Reset Password OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending reset password OTP'
        });
    }
}

/**
 * Reset password using OTP
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Validate password length
        if (newPassword.length < PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters`
            });
        }

        // Find user and verify OTP
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        if (user.forgotPasswordOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.forgotPasswordOtpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Update password and clear OTP
        user.password = await bcrypt.hash(newPassword, 10);
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while resetting password'
        });
    }
}