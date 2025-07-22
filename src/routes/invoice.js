const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler,getPendingInvoicesHandler } = require('../controllers/invoice');


router.patch('/:gstin/:invoice_id', updateInvoiceByIdHandler);
router.get('/:gstin', getInvoiceByGstinHandler);
router.get('/pending/:gstin', getPendingInvoicesHandler);

module.exports = router;




