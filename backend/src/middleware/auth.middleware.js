const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'itqan-secret-key-123';

/**
 * jwtAuthMiddleware
 * Verifies the JWT token from the Authorization header.
 * Expects: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains uid and email
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token.',
    });
  }
};

module.exports = authMiddleware;
