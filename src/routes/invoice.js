const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler, getInvoiceByGstinHandler, getPendingInvoicesHandler, triggerPendingInvoiceReminder } = require('../controllers/invoice');
const { verifyGstinWithApiKey } = require('../middleware/apikeyverifier');
const { decryptRequestBody } = require('../middleware/decrypt-body')
const { encryptResponse } = require('../middleware/encrypt-response')

router.patch('/:gstin/:invoice_id', decryptRequestBody, verifyGstinWithApiKey, encryptResponse(updateInvoiceByIdHandler));
router.get('/:gstin', verifyGstinWithApiKey, encryptResponse(getInvoiceByGstinHandler));
router.get('/pending/:gstin', verifyGstinWithApiKey, encryptResponse(getPendingInvoicesHandler));
// router.get('/test-reminder-cron', triggerPendingInvoiceReminder); // 👈 new route

module.exports = router;




