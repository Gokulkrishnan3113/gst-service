const express = require('express');
const dotenv = require('dotenv');
const vendorRouter = require('./routes/vendor'); // Importing vendor routes
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/', vendorRouter);

app.get('/', (req, res) => {
    res.send('GST Filing Service is up and running 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
