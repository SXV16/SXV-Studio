const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const trackController = require('../controllers/trackController');

// Configure multer memory storage
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// @route   POST /api/tracks
// @desc    Upload a new audio track
// @access  Public (for now)
router.post('/', upload.single('audio'), trackController.uploadTrack);

// @route   GET /api/tracks/user/:userId
// @desc    Get all tracks for a specific user
// @access  Public
router.get('/user/:userId', trackController.getUserTracks);

// @route   DELETE /api/tracks/:id
// @desc    Delete a track
// @access  Public
router.delete('/:id', trackController.deleteTrack);

module.exports = router;
