const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler, getPendingInvoicesHandler, triggerPendingInvoiceReminder } = require('../controllers/invoice');


router.patch('/update-invoice/:gstin/:invoice_id', updateInvoiceByIdHandler);
router.get('/invoices/:gstin', getInvoiceByGstinHandler);
router.get('/pending-invoices/:gstin', getPendingInvoicesHandler);
router.get('/test-reminder-cron', triggerPendingInvoiceReminder); // 👈 new route

module.exports = router;




