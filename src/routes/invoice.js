const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler, getPendingInvoicesHandler, triggerPendingInvoiceReminder } = require('../controllers/invoice');


router.patch('/:gstin/:invoice_id', updateInvoiceByIdHandler);
router.get('/:gstin', getInvoiceByGstinHandler);
router.get('/pending/:gstin', getPendingInvoicesHandler);
router.get('/test-reminder-cron', triggerPendingInvoiceReminder); // 👈 new route

module.exports = router;




