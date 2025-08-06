const { fileGstService } = require('../services/file-gst');
// const { getAllFilings, getFilingsByGstin, getAllFilingsWithInvoices, getAllFilingsWithInvoicesByGstin } = require('../db/queries');
const { getAllFilingsWithInvoices, getAllFilingsWithInvoicesByGstin } = require('../db/queries');
// const { formatMultipleFilingDates } = require('../utils/timeformat-helper');
const { cache, clearCacheByPrefix } = require('../cache/cache');

async function fileGstHandler(req, res) {
    try {
        const result = await fileGstService(req.body);
        if (result.error) {
            // return res.status(result.status || 400).json({ error: result.error });
            return {
                status: result.status || 400,
                message: result.message || 'Validation failed',
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
        if (error.validationErrors) {
            return {
                status: 400,
                message: error.message,
                validationErrors: error.validationErrors
            };
        }
        return {
            status: 500,
            error: 'Internal Server Error'
        }
    }
}

// async function getAllFilingsHandler(req, res) {
//     try {
//         const filings = await getAllFilings();
//         const formattedFilings = formatMultipleFilingDates(filings);
//         if (!filings || filings.length === 0) {
//             return res.status(404).json({ success: false, error: 'No filings found' });
//         }
//         res.status(200).json({ success: true, data: formattedFilings });
//     } catch (error) {
//         console.error('Error fetching filings:', error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// }

// async function getFilingsByIdHandler(req, res) {
//     const { gstin } = req.params;
//     try {
//         const filings = await getFilingsByGstin(gstin);
//         if (filings.length === 0) {
//             return res.status(404).json({ success: false, error: 'No filings found for this GSTIN' });
//         }
//         const formattedFilings = formatMultipleFilingDates(filings);
//         res.status(200).json({ success: true, data: formattedFilings });
//     } catch (error) {
//         console.error('Error fetching filings by GSTIN:', error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// }

async function getAllFilingsWithInvoicesHandler(req, res) {
    try {
        const page = parseInt(req.query.page) || '1';
        const limit = 10;
        const offset = (page - 1) * limit;
        const cacheKey = `filings_with_invoices_page_${page}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                success: true,
                cached: true,
                filings_count: cachedData.filings.length,
                total_count: cachedData.total,
                data: cachedData.filings,
            });
        }
        const { filings, total } = await getAllFilingsWithInvoices(limit, offset);

        if (!filings || filings.length === 0) {
            return res.status(404).json({ success: false, error: 'No filings found' });
        }
        cache.set(cacheKey, { filings, total });
        res.status(200).json({ success: true, cached: false, filings_count: filings.length, total_count: total, data: filings });
    } catch (error) {
        console.error('Error fetching filings with invoices:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getFilingsWithInvoicesByIdHandler(req, res) {
    const { gstin } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const cacheKey = `filings_with_invoices_${gstin}_page_${page}`;

    try {
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                cached: true,
                filings_count: cached.filings.length,
                total_count: cached.total,
                data: cached.filings,
            });
        }

        const { filings, total } = await getAllFilingsWithInvoicesByGstin(gstin, limit, offset);

        if (filings.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No filings found for GSTIN ${gstin}`
            });
        }

        cache.set(cacheKey, { filings, total });

        return res.status(200).json({
            success: true,
            cached: false,
            filings_count: filings.length,
            total_count: total,
            data: filings
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
    // getAllFilingsHandler,
    // getFilingsByIdHandler,
    getAllFilingsWithInvoicesHandler,
    getFilingsWithInvoicesByIdHandler
};
