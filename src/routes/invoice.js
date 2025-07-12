const express = require('express');
const router = express.Router();
const { updateInvoiceByIdHandler } = require('../controllers/invoice');


router.patch('/update-invoice/:gstin/:invoice_id', updateInvoiceByIdHandler);

module.exports = router;




