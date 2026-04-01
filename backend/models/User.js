const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Maps directly to the local MySQL "users" table
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    // Left password_hash in place conditionally for legacy structure, though empty for new Supabase users
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    tier: {
        type: DataTypes.ENUM('Basic', 'DJ', 'Pro DJ'),
        defaultValue: 'Basic'
    },
    artist_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profile_pic_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Supabase handles this, default to true in MySQL 
    },
    verification_token: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = User;

