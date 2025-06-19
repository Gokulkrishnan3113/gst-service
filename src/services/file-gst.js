const { findVendorByGstin, addVendor, getLastInvoiceId, updateLastInvoiceId } = require('../db/queries');
const { getTimeframeRange } = require('../utils/timeframe-helper')
const VALID_TIMEFRAMES = ['monthly', 'quarterly', 'annual'];
const VALID_MERCHANT_TYPES = ['manufacturers', 'retailers', 'wholesellers'];
const invoice = require('../data/invoice.json');
const { filterInvoices } = require('../utils/invoice-filter');
const { calculateGSTSummary } = require('../utils/gstcal-helper');

async function fileGstService(payload) {
    const { gstin, timeframe, merchant_type, name, state } = payload;

    if (!gstin || gstin.length !== 15) {
        return { status: 400, error: 'Invalid GSTIN. Must be 15 characters.' };
    }

    if (!VALID_TIMEFRAMES.includes(timeframe)) {
        return {
            status: 400,
            error: `Invalid timeframe. Must be one of: ${VALID_TIMEFRAMES.join(', ')}`,
        };
    }

    if (!VALID_MERCHANT_TYPES.includes(merchant_type)) {
        return {
            status: 400,
            error: `Invalid merchant type. Must be one of: ${VALID_MERCHANT_TYPES.join(', ')}`,
        };
    }

    let vendor = await findVendorByGstin(gstin);
    if (!vendor) {
        vendor = await addVendor({ gstin, name, merchant_type, state });
        if (!vendor) {
            return { status: 500, error: 'Vendor could not be created' };
        }
    }

    const { startDate, endDate, dueDate, isLate } = getTimeframeRange(timeframe, state);
    console.log({ startDate, endDate, dueDate, isLate });
    const last_invoice_id = await getLastInvoiceId(gstin);
    console.log(`Last invoice ID for ${gstin}: ${last_invoice_id}`);
    const filteredData = filterInvoices(invoice, startDate, endDate, gstin, last_invoice_id);
    if (filteredData.length === 0) {
        return {
            status: 404,
            error: 'No invoices found for the specified date range and GSTIN.',
        };

    }
    console.log(filteredData.length);

    if (filteredData.length > 0) {
        const lastInvoice = filteredData[filteredData.length - 1]; // last one after sorting
        const lastInvoiceIdToUpdate = lastInvoice.invoice_id;
        console.log(`Last invoice ID to update: ${lastInvoiceIdToUpdate}`);

        await updateLastInvoiceId(gstin, lastInvoiceIdToUpdate);
    }
    const turnover = 3_00_00_000
    const isOptedin = true;
    const res = calculateGSTSummary(filteredData, merchant_type, dueDate, timeframe, turnover, isOptedin);
    return {
        status: 200,
        message: 'GST filing successful.',
        data: res
    };

}

module.exports = { fileGstService };
