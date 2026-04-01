const { User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure upload directory for profile pictures
const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const uploadProfilePic = multer({ storage, fileFilter });

// Controller Functions
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'artist_name', 'bio', 'profile_pic_url', 'tier', 'role']
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { artist_name, bio } = req.body;
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (artist_name !== undefined) user.artist_name = artist_name;
        if (bio !== undefined) user.bio = bio;
        
        if (req.file) {
            user.profile_pic_url = `/uploads/profiles/${req.file.filename}`;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                artist_name: user.artist_name,
                bio: user.bio,
                profile_pic_url: user.profile_pic_url,
                tier: user.tier
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePic
};
