/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const protect = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Auth Middleware Error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { protect };
