const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const vendorRouter = require('./routes/vendor'); // Importing vendor routes
const fileGstRoutes = require('./routes/file-gst'); // Importing file GST routes
const invoiceRouter = require('./routes/invoice'); // Importing invoice routes
dotenv.config();

const app = express();
app.use(cors());
app.use((req, res, next) => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(vendorRouter);
app.use(fileGstRoutes);
app.use(invoiceRouter);

app.get('/', (req, res) => {
    res.send('GST Filing Service is up and running 🚀');
});

app.listen(PORT, () => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] 🚀 Server running at http://localhost:${PORT}`);
});

require('./services/pending-invoice-cron');
