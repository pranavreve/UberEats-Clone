// routes/auth.routes.js
const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Register user (customer or restaurant)
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('user_type', 'User type must be customer or restaurant').isIn(['customer', 'restaurant'])
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Logout user
router.post('/logout', authController.logout);

// Get current user
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;