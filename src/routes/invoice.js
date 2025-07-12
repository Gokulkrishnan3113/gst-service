const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler } = require('../controllers/invoice');


router.patch('/update-invoice/:gstin/:invoice_id', updateInvoiceByIdHandler);
router.get('/invoices/:gstin', getInvoiceByGstinHandler);
module.exports = router;




