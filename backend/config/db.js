const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'sxv_studio',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql', // Restored exactly as it was requested!
        logging: false,
        dialectOptions: {
            ...(String(process.env.DB_SSL || '').toLowerCase() === 'true'
                ? {
                    ssl: {
                        require: true,
                        rejectUnauthorized: String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false'
                    }
                }
                : {})
        }
    }
);

const testConnection = async () => {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
};

module.exports = { sequelize, testConnection };

