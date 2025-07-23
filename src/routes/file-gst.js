const express = require('express');
const router = express.Router();
const { fileGstHandler, getAllFilingsHandler, getFilingsByIdHandler, getAllFilingsWithInvoicesHandler, getFilingsWithInvoicesByIdHandler } = require('../controllers/file-gst');
const { verifyDefaultApiKey, verifyGstinWithApiKey } = require('../middleware/apikeyverifier');


router.post('/', verifyGstinWithApiKey, fileGstHandler);
// router.get('/filings', getAllFilingsHandler);
// router.get('/filings/:gstin', getFilingsByIdHandler);
router.get('/filings-with-invoices', verifyDefaultApiKey, getAllFilingsWithInvoicesHandler);
router.get('/filings-with-invoices/:gstin', verifyDefaultApiKey, getFilingsWithInvoicesByIdHandler);

module.exports = router;
