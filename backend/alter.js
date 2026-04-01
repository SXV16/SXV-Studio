const { sequelize } = require('./config/db');

async function run() {
  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0;');
    console.log('Added is_verified');
  } catch (e) {
    console.log('Failed is_verified: ', e.message);
  }

  try {
    await sequelize.query('ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);');
    console.log('Added verification_token');
  } catch (e) {
    console.log('Failed verification_token: ', e.message);
  }
  process.exit(0);
}
run();
