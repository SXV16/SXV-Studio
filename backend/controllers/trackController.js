const { AudioTrack, User } = require('../models');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase Client for Storage
const supabaseUrl = process.env.SUPABASE_URL || 'https://pzkqeeenbzkltiqccdfn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_PbEGhjU3Jf5cm23AfwUaWg_wKXY_xz8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure upload processing
const uploadTrack = async (req, res) => {
    try {
        let file_url;
        let actualFileSize = 0;

        if (req.file) {
            actualFileSize = req.file.size;
            
            // Stream memory buffer directly into Supabase Storage
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = 'track-' + uniqueSuffix + path.extname(req.file.originalname || '.webm');
            
            const { data, error } = await supabase.storage
                .from('audio_tracks')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype || 'audio/webm',
                    upsert: false
                });
                
            if (error) {
                console.error("Supabase Storage Error:", error);
                return res.status(500).json({ message: 'Failed to upload audio to cloud storage', error: error.message });
            }
            
            // Retrieve definitive public URL
            const { publicUrl } = supabase.storage
                .from('audio_tracks')
                .getPublicUrl(fileName).data;
                
            file_url = publicUrl;
        } else if (req.body.file_url) {
            file_url = req.body.file_url;
            actualFileSize = parseInt(req.body.file_size) || 0;
        } else {
            return res.status(400).json({ message: 'No audio file or file_url provided.' });
        }

        const { title, user_id } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Track title is required.' });
        }

        if (user_id) {
            const user = await User.findByPk(user_id);
            if (user) {
                const tracks = await AudioTrack.findAll({ where: { user_id } });
                let currentStorage = 0;
                let trackCount = tracks.length;
                tracks.forEach(t => currentStorage += (t.file_size || 0));

                if (user.tier === 'Basic' && trackCount >= 10) {
                    if (req.file) {
                        const fileName = file_url.split('/').pop();
                        supabase.storage.from('audio_tracks').remove([fileName]).then(() => {});
                    }
                    return res.status(403).json({ message: 'Basic Tier is limited to 10 tracks. Please upgrade to upload more.' });
                }
                
                if ((user.tier === 'Basic' && (currentStorage + actualFileSize > 50 * 1024 * 1024)) ||
                    (user.tier === 'DJ' && (currentStorage + actualFileSize > 500 * 1024 * 1024))) {
                    
                    if (req.file) {
                        const fileName = file_url.split('/').pop();
                        supabase.storage.from('audio_tracks').remove([fileName]).then(() => {});
                    }
                    return res.status(403).json({ message: `Storage limit reached for ${user.tier} Tier. Please upgrade.` });
                }
            }
        }

        // Create the database record
        const track = await AudioTrack.create({
            title,
            file_url,
            user_id: user_id || null, // Tie to user if provided
            file_size: actualFileSize
        });

        res.status(201).json({
            message: 'Track uploaded successfully',
            track
        });
    } catch (error) {
        console.error('Error uploading track:', error);
        res.status(500).json({ message: 'Server error during upload.', error: error.message });
    }
};

const getUserTracks = async (req, res) => {
    try {
        const { userId } = req.params;
        const tracks = await AudioTrack.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        res.status(200).json(tracks);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ message: 'Server error fetching tracks.', error: error.message });
    }
};

const deleteTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const track = await AudioTrack.findByPk(id);

        if (!track) {
            return res.status(404).json({ message: 'Track not found' });
        }

        // Delete purely from Cloud Storage securely
        if (track.file_url && track.file_url.includes('supabase.co')) {
            const fileName = track.file_url.split('/').pop();
            const { error } = await supabase.storage.from('audio_tracks').remove([fileName]);
            if (error) console.error("Could not delete cloud file:", error);
        }

        // Delete Database record
        await track.destroy();
        
        res.status(200).json({ message: 'Track deleted successfully' });
    } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ message: 'Server error deleting track.', error: error.message });
    }
}

module.exports = {
    uploadTrack,
    getUserTracks,
    deleteTrack
};
