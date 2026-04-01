const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new node user
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Login and fetch token
// @access  Public
router.post('/login', authController.loginUser);

// @route   POST /api/auth/verify
// @desc    Verify a new account
// @access  Public
router.post('/verify', authController.verifyEmail);

module.exports = router;
