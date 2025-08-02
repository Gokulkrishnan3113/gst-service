const { fileGstService } = require('../services/file-gst');
// const { getAllFilings, getFilingsByGstin, getAllFilingsWithInvoices, getAllFilingsWithInvoicesByGstin } = require('../db/queries');
const { getAllFilingsWithInvoices, getAllFilingsWithInvoicesByGstin } = require('../db/queries');
// const { formatMultipleFilingDates } = require('../utils/timeformat-helper');
const cache = require('../cache/cache');
async function fileGstHandler(req, res) {
    try {
        const result = await fileGstService(req.body);
        if (result.error) {
            // return res.status(result.status || 400).json({ error: result.error });
            return {
                status: result.status || 400,
                error: result.error
            };
        }

        return {
            status: result.status || 200,
            message: result.message || "GST filing successful.",
            data: result.data || result
        };
    } catch (error) {
        console.error('Error filing GST:', error);
        // res.status(500).json({ error: 'Internal Server Error' });
        return {
            status: 500,
            error: 'Internal Server Error'
        }
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

async function getAllFilingsWithInvoicesHandler(req, res) {
    try {
        const cacheKey = 'filings_with_invoices_all';
        const cachedfilings = cache.get(cacheKey);

        if (cachedfilings) {
            return res.status(200).json({
                success: true,
                cached: true,
                filings_count: cachedfilings.length,
                data: cachedfilings,
            });
        }
        const filings = await getAllFilingsWithInvoices();
        if (!filings || filings.length === 0) {
            return res.status(404).json({ success: false, error: 'No filings found' });
        }
        cache.set(cacheKey, filings);
        res.status(200).json({ success: true, cached: false, filings_count: filings.length, data: filings });
    } catch (error) {
        console.error('Error fetching filings with invoices:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getFilingsWithInvoicesByIdHandler(req, res) {
    const { gstin } = req.params;
    const cacheKey = `filings_with_invoices_${gstin}`;
    try {
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                cached: true,
                message: `Filings with invoices for GSTIN ${gstin} retrieved (from cache).`,
                filings_count: cached.length,
                data: cached,
            });
        }

        const data = await getAllFilingsWithInvoicesByGstin(gstin);

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No filings found for GSTIN ${gstin}`
            });
        }

        cache.set(cacheKey, data);

        return res.status(200).json({
            success: true,
            cached: false,
            message: `Filings with invoices for GSTIN ${gstin} retrieved.`,
            filings_count: data.length,
            data
        });
    } catch (error) {
        console.error('Error fetching filings with invoices:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


module.exports = {
    fileGstHandler,
    getAllFilingsHandler,
    getFilingsByIdHandler,
    getAllFilingsWithInvoicesHandler,
    getFilingsWithInvoicesByIdHandler
};
