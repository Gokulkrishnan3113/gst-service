const express = require('express');
const router = express.Router();
const { getLedgerLogsHandler, getBalanceHandler, getCreditNotesHandler } = require('../controllers/ledger');
const { verifyAuth } = require('../middleware/apikeyverifier');

router.get('/:gstin', verifyAuth, getLedgerLogsHandler);
router.get('/balance/:gstin', verifyAuth, getBalanceHandler);
router.get('/credit-notes/:gstin', verifyAuth, getCreditNotesHandler);


module.exports = router;
