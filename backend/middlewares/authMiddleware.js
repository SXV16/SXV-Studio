const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verify native JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_local_dev');
        
        // Check if user exists securely
        const localUser = await User.findByPk(decoded.id);
        if (!localUser) {
            return res.status(401).json({ message: 'Token is not valid or user does not exist' });
        }
        
        // Attach the fully synced user to the request 
        req.user = localUser; 
        
        next();
    } catch (err) {
        console.error('Middleware Sync Error:', err);
        return res.status(401).json({ message: 'Server Error during authentication' });
    }
};

module.exports = { authMiddleware };

