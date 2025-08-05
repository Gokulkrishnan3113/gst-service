const express = require('express');
const router = express.Router();
const { fileGstHandler, getAllFilingsHandler, getFilingsByIdHandler, getAllFilingsWithInvoicesHandler, getFilingsWithInvoicesByIdHandler } = require('../controllers/file-gst');
const { verifyDefaultApiKey, verifyAuth } = require('../middleware/apikeyverifier');
const { decryptRequestBody } = require('../middleware/decrypt-body')
const { encryptResponse } = require('../middleware/encrypt-response')


router.post('/', decryptRequestBody, verifyAuth, encryptResponse(fileGstHandler));
// router.post('/', verifyAuth, encryptResponse(fileGstHandler));
// router.get('/filings', getAllFilingsHandler);
// router.get('/filings/:gstin', getFilingsByIdHandler);
router.get('/filings-with-invoices', verifyDefaultApiKey, getAllFilingsWithInvoicesHandler);
router.get('/filings-with-invoices/:gstin', verifyDefaultApiKey, getFilingsWithInvoicesByIdHandler);

module.exports = router;
