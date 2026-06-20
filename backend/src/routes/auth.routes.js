const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/auth/register
 * Handles user registration.
 */
router.post('/register', authController.signup);

/**
 * POST /api/auth/login
 * Handles user login.
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Returns the current authenticated user's data.
 */
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
