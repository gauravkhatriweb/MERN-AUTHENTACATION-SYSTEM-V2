import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * @description Verifies JWT token from cookies and adds userId to request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const userAuth = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        try {
            // Verify token and extract user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
            next();
        } catch (jwtError) {
            // Handle invalid or expired token
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

export default userAuth;
