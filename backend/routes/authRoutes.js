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

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with emailed token
// @access  Public
router.post('/reset-password', authController.resetPassword);

// @route   POST /api/auth/sync-password
// @desc    Sync password from Supabase password reset
// @access  Public
router.post('/sync-password', authController.syncPassword);

module.exports = router;
