const { fileGstService, formatDate } = require('../services/file-gst');
const { getAllFilings, getFilingsByGstin } = require('../db/queries');
const { formatMultipleFilingDates } = require('../utils/timeformat-helper');
async function fileGstHandler(req, res) {
    try {
        const result = await fileGstService(req.body);
        if (result.error) {
            return res.status(result.status || 400).json({ error: result.error });
        }

        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error filing GST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllFilingsHandler(req, res) {
    try {
        const filings = await getAllFilings();
        const formattedFilings = formatMultipleFilingDates(filings);
        if (!filings || filings.length === 0) {
            return res.status(404).json({ success: false, error: 'No filings found' });
        }
        res.status(200).json({ success: true, data: formattedFilings });
    } catch (error) {
        console.error('Error fetching filings:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getFilingsByIdHandler(req, res) {
    const { gstin } = req.params;
    try {
        const filings = await getFilingsByGstin(gstin);
        if (filings.length === 0) {
            return res.status(404).json({ success: false, error: 'No filings found for this GSTIN' });
        }
        const formattedFilings = formatMultipleFilingDates(filings);
        res.status(200).json({ success: true, data: formattedFilings });
    } catch (error) {
        console.error('Error fetching filings by GSTIN:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

module.exports = { fileGstHandler, getAllFilingsHandler, getFilingsByIdHandler };
