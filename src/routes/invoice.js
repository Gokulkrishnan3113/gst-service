const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler, getPendingInvoicesHandler, triggerPendingInvoiceReminder } = require('../controllers/invoice');
const { verifyAuth } = require('../middleware/apikeyverifier');
const { decryptRequestBody } = require('../middleware/decrypt-body')
const { encryptResponse } = require('../middleware/encrypt-response')

router.patch('/:gstin/:invoice_id', decryptRequestBody, verifyAuth, encryptResponse(updateInvoiceByIdHandler));
router.get('/:gstin', verifyAuth, encryptResponse(getInvoiceByGstinHandler));
router.get('/pending/:gstin', verifyAuth, encryptResponse(getPendingInvoicesHandler));
// router.get('/test-reminder-cron', triggerPendingInvoiceReminder); // 👈 new route

module.exports = router;




