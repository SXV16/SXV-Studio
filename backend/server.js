require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/db');
require('./models'); // Import to define associations

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const profileRoutes = require('./routes/profileRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stripe', stripeRoutes); // Should happen after generic express.json if configured securely, we used express.raw in the router.

// Expose public folder for audio tracking URLs
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webm')) {
            res.setHeader('Content-Type', 'audio/webm');
        }
    }
}));

// Basic Route for Testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SXV Studio API' });
});

// Sync Database & Start Server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await testConnection();
    try {
        // Sync models with database
        // In dev, sometimes alter: true is useful. Avoid force: true to not drop tables.
        await sequelize.sync();
        console.log('Database synced');
    } catch (error) {
        console.error('Failed to sync database:', error);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
};

startServer();
