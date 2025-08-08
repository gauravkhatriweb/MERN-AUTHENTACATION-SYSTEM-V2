import UserModel from '../models/userModel.js';

/**
 * User Controller
 * @description Handles user-related operations
 */

/**
 * Get user profile data
 * @route GET /api/user/get-user-data
 * @protected
 * @description Retrieves basic user profile information using the userId from auth middleware
 */
export const getUserData = async (req, res) => {
    try {
        // Find user by ID (set by auth middleware)
        const user = await UserModel.findById(req.userId).select('-password -verifyOtp -verifyOtpExpiry -forgotPasswordOtp -forgotPasswordOtpExpiry');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User data retrieved successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isAccountVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Get User Data Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching user data'
        });
    }
}