const axios = require('axios');
const cron = require('node-cron');

const HEALTH_URL = 'http://localhost:8080/health';

cron.schedule('*/5 * * * *', async () => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] Running health check...`);
    try {
        const res = await axios.get(HEALTH_URL);
        console.log(JSON.stringify(res.data, null, 2)); // Nicely formatted full response
    } catch (err) {
        console.error(`❌ Health check failed: ${err.message}`);
    }
});
