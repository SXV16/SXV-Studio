const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registration Logic
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

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
        const crypto = require('crypto');
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

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, tier: newUser.tier },
            process.env.JWT_SECRET || 'fallback_secret_for_local_dev',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
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
        const { email, password } = req.body;

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

module.exports = { registerUser, loginUser, verifyEmail };
