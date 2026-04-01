const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tier: {
        type: DataTypes.ENUM('free', 'pro', 'studio'),
        defaultValue: 'free'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
        defaultValue: 'active'
    },
    start_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'subscriptions',
    timestamps: false
});

module.exports = Subscription;
