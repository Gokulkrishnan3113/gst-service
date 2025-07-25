const express = require('express');
const { 
    updateInvoiceByIdHandler, 
    getInvoiceByGstinHandler, 
    getPendingInvoicesHandler 
} = require('../controllers/invoice-controller');
const { verifyGstinWithApiKey } = require('../middleware/auth-middleware');

const router = express.Router();

router.patch('/:gstin/:invoice_id', verifyGstinWithApiKey, updateInvoiceByIdHandler);
router.get('/:gstin', verifyGstinWithApiKey, getInvoiceByGstinHandler);
router.get('/pending/:gstin', verifyGstinWithApiKey, getPendingInvoicesHandler);

module.exports = router;