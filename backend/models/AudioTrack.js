const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AudioTrack = sequelize.define('AudioTrack', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_url: {
        type: DataTypes.STRING, // Or LONGTEXT/BLOB depending on how we decide to store, let's use a path/URL for now.
        allowNull: false
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0
    }
}, {
    tableName: 'audio_tracks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = AudioTrack;
