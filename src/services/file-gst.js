const { findVendorByGstin, addVendor, getLastInvoiceId, updateLastInvoiceId, addGstFiling, getFilingsByGstin, addInvoices } = require('../db/queries');
const { getTimeframeRange } = require('../utils/timeframe-helper')
const VALID_TIMEFRAMES = ['monthly', 'quarterly', 'annual'];
const VALID_MERCHANT_TYPES = ['manufacturers', 'retailers', 'wholesellers'];
const invoice = require('../data/invoice.json');
const { filterInvoices } = require('../utils/invoice-filter');
const { calculateGSTSummary } = require('../utils/gstcal-helper');
const { detectFilingConflicts } = require('../utils/conflict-helper');
const { formatFilingDates } = require('../utils/timeformat-helper');
function formatDate(d) {
    const date = new Date(d);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

async function fileGstService(payload) {
    const { gstin, timeframe, merchant_type, name, state, turnover, is_itc_optedin } = payload;
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
    if (!state) {
        return {
            status: 400,
            error: `Missing field - state`,
        };
    }

    if (!turnover) {
        return {
            status: 400,
            error: `Missing field - turnover`,
        };
    }
    if (is_itc_optedin === undefined) {
        return {
            status: 400,
            error: `Missing field - is_itc_optedin`,
        };
    }


    let vendor = await findVendorByGstin(gstin);
    if (!vendor) {
        vendor = await addVendor({ gstin, name, merchant_type, state, turnover, is_itc_optedin });
        if (!vendor) {
            return { status: 500, error: 'Vendor could not be created' };
        }
    }

    const { startDate, endDate, dueDate, isLate } = getTimeframeRange(timeframe, state);
    console.log({ startDate, endDate, dueDate, isLate });
    const resultfromdb = await getFilingsByGstin(gstin);

    const existingFiling = resultfromdb.find(filing =>
        formatDate(filing.filing_start_date) === startDate &&
        formatDate(filing.filing_end_date) === endDate
    );

    if (existingFiling) {
        const formattedFiling = formatFilingDates(existingFiling);
        return {
            status: 409, // Conflict
            message: 'Filing already exists for this timeframe.',
            data: formattedFiling
        };
    }

    const conflict = detectFilingConflicts(timeframe, startDate, endDate, resultfromdb);

    if (conflict) {
        const formattedConflict = formatFilingDates(conflict);
        return {
            status: 409,
            message: `Filing conflict: A ${conflict.timeframe} filing already exists overlapping this period.`,
            data: formattedConflict
        };
    }

    // const last_invoice_id = await getLastInvoiceId(gstin);
    // console.log(`Last invoice ID for ${gstin}: ${last_invoice_id}`);
    last_invoice_id = null;
    const filteredData = filterInvoices(invoice, startDate, endDate, gstin, last_invoice_id);
    if (filteredData.length === 0) {
        return {
            status: 404,
            error: 'No invoices found for the specified date range and GSTIN.',
        };

    }
    // console.log(filteredData.length);

    // if (filteredData.length > 0) {
    //     const lastInvoice = filteredData[filteredData.length - 1]; // last one after sorting
    //     const lastInvoiceIdToUpdate = lastInvoice.invoice_id;
    //     console.log(`Last invoice ID to update: ${lastInvoiceIdToUpdate}`);

    //     await updateLastInvoiceId(gstin, lastInvoiceIdToUpdate);
    // }
    const res = calculateGSTSummary(filteredData, merchant_type, dueDate, timeframe, turnover, is_itc_optedin);

    const gstFiling = await addGstFiling({
        gstin,
        timeframe,
        startDate,
        endDate,
        dueDate,
        isLate,
        totalAmount: Number(res.totalAmount.toFixed(2)),
        totalTax: Number(res.totalTax.toFixed(2)),
        invoiceCount: filteredData.length,
        inputTaxCredit: Number(res.inputTaxCredit.toFixed(2)),
        taxPayable: Number((res.totalTax - res.inputTaxCredit).toFixed(2)),
        penalty: Number(res.penalty.toFixed(2)),
        totalPayableAmount: Number((res.totalTax - res.inputTaxCredit + res.penalty).toFixed(2))
    });

    await addInvoices(gstFiling.id, filteredData);

    return {
        status: 200,
        message: 'GST filing successful.',
        data: {
            ...gstFiling,
            filing_start_date: formatDate(gstFiling.filing_start_date),
            filing_end_date: formatDate(gstFiling.filing_end_date),
            due_date: formatDate(gstFiling.due_date),
            filed_at: gstFiling.filed_at
        }
    };

}

module.exports = { fileGstService, formatDate };
