const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Optional: test connection once when server boots
(async () => {
    try {
        await db.query('SELECT 1');
        console.log('✅ PostgreSQL connected and verified at startup');
    } catch (err) {
        console.error('❌ PostgreSQL connection failed:', err);
        process.exit(1); // exit app if DB is mandatory
    }
})();

module.exports = db;
