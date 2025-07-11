const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const vendorRouter = require('./routes/vendor'); // Importing vendor routes
const fileGstRoutes = require('./routes/file-gst'); // Importing file GST routes
dotenv.config();

const app = express();
app.use(cors());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(vendorRouter);
app.use(fileGstRoutes); // Register your /file-gst endpoint

app.get('/', (req, res) => {
    res.send('GST Filing Service is up and running 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
