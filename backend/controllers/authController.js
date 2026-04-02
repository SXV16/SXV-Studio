const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { createClient } = require('@supabase/supabase-js');
const { isMailConfigured } = require('../services/mailService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/authEmailService');

const supabaseUrl = process.env.SUPABASE_URL || 'https://pzkqeeenbzkltiqccdfn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_PbEGhjU3Jf5cm23AfwUaWg_wKXY_xz8';
const supabase = createClient(supabaseUrl, supabaseKey);

const getSupabaseResetRedirect = () => process.env.SUPABASE_RESET_REDIRECT_URL || `${process.env.APP_BASE_URL || 'http://localhost:4200'}/reset-password`;

// Registration Logic
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if user already exists entirely
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: 'That Artist Name is already taken! Please choose another.' });
        }

        // Apply sxvxgemelo Master Access Rule natively
        let startingTier = 'Basic';
        if (username.replace(/\s+/g, '').toLowerCase() === 'sxvxgemelo' || email.toLowerCase() === 'sxvxgemelo') {
            startingTier = 'Pro DJ';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token securely
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create user
        const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            tier: startingTier,
            is_verified: false,
            verification_token: verificationToken
        });

        let responseMessage = 'User registered successfully, but SMTP is not configured yet so no verification email was sent.';

        if (isMailConfigured()) {
            try {
                await sendVerificationEmail({
                    email: newUser.email,
                    token: verificationToken,
                    username: newUser.username
                });
                responseMessage = 'User registered successfully. Please check your email to verify your account.';
            } catch (mailError) {
                console.error('Verification Email Error:', mailError);
                responseMessage = 'User registered successfully, but the verification email could not be sent. Please contact support or retry after SMTP is fixed.';
            }
        }

        res.status(201).json({
            message: responseMessage,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                tier: newUser.tier
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// Login Logic
const loginUser = async (req, res) => {
    try {
        const { password } = req.body;
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

        if (!user.password_hash) {
            return res.status(401).json({ message: 'This account was created via Supabase. Please reset your password or sign up again.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

        // Validate verification
        if (!user.is_verified) {
             return res.status(403).json({ 
                 message: 'Email not verified. Please verify your email first.',
                 verification_token: user.verification_token
             });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, tier: user.tier },
            process.env.JWT_SECRET || 'fallback_secret_for_local_dev',
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                tier: user.tier
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'No verification token provided' });
        }

        const user = await User.findOne({ where: { verification_token: token } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.is_verified = true;
        user.verification_token = null;
        await user.save();

        res.json({ message: 'Account verified successfully!' });
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ where: { email: normalizedEmail } });

        if (!user) {
            return res.json({ message: 'If the email exists, a password reset link has been sent to it.' });
        }

        if (!user.password_hash) {
            const { error } = await supabase.auth.api.resetPasswordForEmail(user.email, {
                redirectTo: getSupabaseResetRedirect()
            });

            if (error) {
                console.error('Supabase Reset Email Error:', error);
                return res.status(500).json({ message: 'Unable to send reset email right now.' });
            }

            return res.json({ message: 'If the email exists, a password reset link has been sent to it.' });
        }

        if (!isMailConfigured()) {
            return res.status(500).json({
                message: 'SMTP is not configured on the backend. Set SMTP env vars before using native password reset.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.reset_password_token = resetToken;
        user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        await sendPasswordResetEmail({
            email: user.email,
            token: resetToken,
            username: user.username
        });

        return res.json({ message: 'If the email exists, a password reset link has been sent to it.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return res.status(500).json({ message: 'Server error while requesting password reset.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset link.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        user.reset_password_token = null;
        user.reset_password_expires = null;

        if (!user.is_verified) {
            user.is_verified = true;
            user.verification_token = null;
        }

        await user.save();

        return res.json({ message: 'Password successfully updated! You can now log in securely.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ message: 'Server error while resetting password.' });
    }
};

// Sync Password after Supabase Reset
const syncPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const email = String(req.body.email || '').trim().toLowerCase();

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password and update native node DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password_hash = hashedPassword;
        
        // Optionally auto-verify if they managed to reset their password via email
        if (!user.is_verified) {
            user.is_verified = true;
            user.verification_token = null;
        }

        await user.save();

        res.json({ message: 'Password synchronized natively successfully!' });
    } catch (error) {
        console.error('Sync Password Error:', error);
        res.status(500).json({ message: 'Server error parsing reset' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    syncPassword
};
