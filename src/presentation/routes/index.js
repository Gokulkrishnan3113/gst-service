const express = require('express');
const vendorRoutes = require('./vendor-routes');
const gstRoutes = require('./gst-routes');
const invoiceRoutes = require('./invoice-routes');
const ledgerRoutes = require('./ledger-routes');
const healthRoutes = require('./health-routes');

const router = express.Router();

// Mount all route modules
router.use('/vendors', vendorRoutes);
router.use('/gst', gstRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/', healthRoutes);

module.exports = router;