const express = require('express');
const router = express.Router();
const { getLedgerLogsHandler, getBalanceHandler } = require('../controllers/ledger');

router.get('/ledger/:gstin', getLedgerLogsHandler);
router.get('/balance/:gstin', getBalanceHandler);

module.exports = router;
