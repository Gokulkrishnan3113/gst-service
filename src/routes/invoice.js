const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler,getPendingInvoicesHandler } = require('../controllers/invoice');


router.patch('/update-invoice/:gstin/:invoice_id', updateInvoiceByIdHandler);
router.get('/invoices/:gstin', getInvoiceByGstinHandler);
router.get('/pending-invoices/:gstin', getPendingInvoicesHandler);

module.exports = router;




