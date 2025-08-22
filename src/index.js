const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const vendorRouter = require('./routes/vendor'); // Importing vendor routes
const fileGstRoutes = require('./routes/file-gst'); // Importing file GST routes
const invoiceRouter = require('./routes/invoice'); // Importing invoice routes
const ledgerRouter = require('./routes/ledger'); // Importing ledger routes
const { rateLimiter, getRateLimiterMetrics } = require('./middleware/ratelimiter');

dotenv.config({ override: true });

function formatBytes(bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

const app = express();
app.use(cors());
app.use(rateLimiter);

app.use((req, res, next) => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
});

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/vendors', vendorRouter);
app.use('/gst', fileGstRoutes);
app.use('/invoice', invoiceRouter);
app.use('/ledger', ledgerRouter);

app.get('/health', (req, res) => {
    const mem = process.memoryUsage();

    res.json({
        status: 'GST Filing Service is up and running 🚀',
        memory: {
            rss: formatBytes(mem.rss),
            heapTotal: formatBytes(mem.heapTotal),
            heapUsed: formatBytes(mem.heapUsed),
        },
        rateLimiter: getRateLimiterMetrics()

    });
});

app.listen(PORT, "0.0.0.0", () => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] 🚀 Server running at http://0.0.0.0:${PORT}`);
});

require('./services/pending-invoice-cron');
require('./services/health-cron');
