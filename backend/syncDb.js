require('dotenv').config();
const { sequelize } = require('./config/db');
const { User } = require('./models');

const syncDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized with alter:true successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to sync DB', error);
        process.exit(1);
    }
};

syncDb();
