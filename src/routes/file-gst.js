const express = require('express');
const router = express.Router();
const { fileGstHandler, getAllFilingsHandler, getFilingsByIdHandler } = require('../controllers/file-gst');

router.post('/file-gst', fileGstHandler);
router.get('/filings', getAllFilingsHandler);
router.get('/filings/:gstin', getFilingsByIdHandler);

module.exports = router;
