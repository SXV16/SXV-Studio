const { AudioTrack } = require('./models');
const { testConnection } = require('./config/db');

async function run() {
    await testConnection();
    const tracks = await AudioTrack.findAll({ order: [['id', 'DESC']], limit: 5 });
    require('fs').writeFileSync('out.json', JSON.stringify(tracks.map(t => t.dataValues), null, 2));
    process.exit(0);
}
run();
