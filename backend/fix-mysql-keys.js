const { sequelize } = require('./config/db');

async function fixKeys() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const [results, metadata] = await sequelize.query("SHOW INDEX FROM users;");
        
        let keysToKeep = new Set(['PRIMARY']);
        let usernameKeys = [];
        let emailKeys = [];

        results.forEach(row => {
            if (row.Key_name === 'PRIMARY') return;
            if (row.Column_name === 'username') usernameKeys.push(row.Key_name);
            if (row.Column_name === 'email') emailKeys.push(row.Key_name);
        });

        // Keep the first one of each
        if (usernameKeys.length > 0) keysToKeep.add(usernameKeys[0]);
        if (emailKeys.length > 0) keysToKeep.add(emailKeys[0]);

        // Drop others
        for (const row of results) {
            const keyName = row.Key_name;
            if (!keysToKeep.has(keyName)) {
                console.log('Dropping key:', keyName);
                if (keyName.includes('username') || keyName.includes('email') || keyName.startsWith('users_')) {
                    try {
                        await sequelize.query(`ALTER TABLE users DROP INDEX \`${keyName}\`;`);
                        console.log(`Dropped index ${keyName}`);
                    } catch (err) {
                        console.log(`Failed to drop index ${keyName} - perhaps already dropped if composite`);
                    }
                }
            }
        }
        console.log('Finished dropping extra keys.');
        
        // Now force the alter
        const User = require('./models/User'); // this needs full models load actually, let's use the models dir
        const db = require('./models');
        await sequelize.sync({ alter: true });
        console.log('Synced successfully with alter: true');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixKeys();
