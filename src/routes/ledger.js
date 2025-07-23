const express = require('express');
const router = express.Router();
const { getLedgerLogsHandler, getBalanceHandler, getCreditNotesHandler } = require('../controllers/ledger');
const { verifyGstinWithApiKey } = require('../middleware/apikeyverifier');

router.get('/:gstin', verifyGstinWithApiKey, getLedgerLogsHandler);
router.get('/balance/:gstin', verifyGstinWithApiKey, getBalanceHandler);
router.get('/credit-notes/:gstin', verifyGstinWithApiKey, getCreditNotesHandler);


module.exports = router;
