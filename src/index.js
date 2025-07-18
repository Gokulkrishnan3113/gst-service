const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { decryptMiddleware, encryptMiddleware } = require('./utils/encryption');
const vendorRouter = require('./routes/vendor'); // Importing vendor routes
const fileGstRoutes = require('./routes/file-gst'); // Importing file GST routes
const invoiceRouter = require('./routes/invoice'); // Importing invoice routes
const ledgerRouter = require('./routes/ledger'); // Importing ledger routes
dotenv.config();

const app = express();
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Apply encryption middleware to all routes
app.use(decryptMiddleware);
app.use(encryptMiddleware);

app.use(vendorRouter);
app.use(fileGstRoutes);
app.use(invoiceRouter);
app.use(ledgerRouter);

app.get('/', (req, res) => {
    res.send('GST Filing Service is up and running 🚀');
});

app.listen(PORT, () => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] 🚀 Server running at http://localhost:${PORT}`);
});

require('./services/pending-invoice-cron');
