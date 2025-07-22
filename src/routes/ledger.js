const express = require('express');
const router = express.Router();
const { getLedgerLogsHandler, getBalanceHandler, getCreditNotesHandler } = require('../controllers/ledger');

router.get('/:gstin', getLedgerLogsHandler);
router.get('/balance/:gstin', getBalanceHandler);
router.get('/credit-notes/:gstin', getCreditNotesHandler);


module.exports = router;
