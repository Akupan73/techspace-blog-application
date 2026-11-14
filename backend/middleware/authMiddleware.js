const jwt = require('jsonwebtoken');
require('dotenv').config();

// Authentication middleware
const authenticateToken = (req, res, next) => {

    // Get token from request header
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please log in first.'
        });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Attach authenticated user to request
        req.user = user;

        next();
    });
};

module.exports = authenticateToken;
