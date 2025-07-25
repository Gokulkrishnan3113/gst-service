const express = require('express');
const { 
    fileGstHandler, 
    getAllFilingsWithInvoicesHandler, 
    getFilingsWithInvoicesByIdHandler 
} = require('../controllers/gst-controller');
const { verifyDefaultApiKey, verifyGstinWithApiKey } = require('../middleware/auth-middleware');

const router = express.Router();

router.post('/', verifyGstinWithApiKey, fileGstHandler);
router.get('/filings-with-invoices', verifyDefaultApiKey, getAllFilingsWithInvoicesHandler);
router.get('/filings-with-invoices/:gstin', verifyDefaultApiKey, getFilingsWithInvoicesByIdHandler);

module.exports = router;