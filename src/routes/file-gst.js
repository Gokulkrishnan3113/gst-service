const express = require('express');
const router = express.Router();
const { fileGstHandler, getAllFilingsHandler, getFilingsByIdHandler, getAllFilingsWithInvoicesHandler, getFilingsWithInvoicesByIdHandler } = require('../controllers/file-gst');

router.post('/', fileGstHandler);
// router.get('/filings', getAllFilingsHandler);
// router.get('/filings/:gstin', getFilingsByIdHandler);
router.get('/filings-with-invoices', getAllFilingsWithInvoicesHandler);
router.get('/filings-with-invoices/:gstin', getFilingsWithInvoicesByIdHandler);

module.exports = router;
