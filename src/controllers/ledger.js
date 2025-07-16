const { getLedgerLogs, getBalance, getCreditNoteByGstin } = require('../db/queries');


async function getLedgerLogsHandler(req, res) {
    const { gstin } = req.params;
    if (!gstin) {
        return res.status(400).json({ success: false, error: 'Missing GSTIN' });
    }
    try {
        const logs = await getLedgerLogs(gstin);
        res.status(200).json({ success: true, ledger_entries: logs.length, data: logs });
    } catch (err) {
        console.error('Error fetching ledger logs:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}



async function getBalanceHandler(req, res) {
    const { gstin } = req.params;
    if (!gstin) {
        return res.status(400).json({ success: false, error: 'Missing GSTIN' });
    }

    try {
        const balance = await getBalance(gstin);
        if (!balance) {
            return res.status(404).json({ success: false, error: 'No balance found for the given GSTIN' });
        }
        res.status(200).json({ success: true, data: balance });
    } catch (err) {
        console.error('Error fetching balance:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getCreditNotesHandler(req, res) {
    const { gstin } = req.params;
    if (!gstin) {
        return res.status(400).json({ success: false, error: 'Missing GSTIN' });
    }
    try {
        const creditnotes = await getCreditNoteByGstin(gstin);
        if (!creditnotes) {
            return res.status(404).json({ success: false, error: 'No credit notes found for the given GSTIN' });
        }
        res.status(200).json({ success: true, credit_notes_count: creditnotes.length, data: creditnotes });
    } catch (err) {
        console.error('Error fetching credit notes:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

module.exports = {
    getLedgerLogsHandler,
    getBalanceHandler,
    getCreditNotesHandler
};