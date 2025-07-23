const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler, getPendingInvoicesHandler, triggerPendingInvoiceReminder } = require('../controllers/invoice');
const { verifyGstinWithApiKey } = require('../middleware/apikeyverifier');

router.patch('/:gstin/:invoice_id', verifyGstinWithApiKey, updateInvoiceByIdHandler);
router.get('/:gstin', verifyGstinWithApiKey, getInvoiceByGstinHandler);
router.get('/pending/:gstin', verifyGstinWithApiKey, getPendingInvoicesHandler);
// router.get('/test-reminder-cron', triggerPendingInvoiceReminder); // 👈 new route

module.exports = router;




