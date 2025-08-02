const { findVendorByGstin, addVendor, addGstFiling, getFilingsByGstin, addInvoices, getInvoicesToBeFiledAgain, upsertBalance, insertLedgerTransaction } = require('../db/queries');
const { getTimeframeRange } = require('../utils/timeframe-helper')
const cache = require('../cache/cache');
const VALID_TIMEFRAMES = ['monthly', 'quarterly', 'annual'];
// const VALID_MERCHANT_TYPES = ['manufacturers', 'retailers', 'wholesellers'];
// const invoice = require('../data/invoice.json');
const invoice = require('../data/invoicewithproduct3.json');
const { filterInvoices } = require('../utils/invoice-filter');
const { calculateGSTSummary } = require('../utils/gstcal-helper');
const { detectFilingConflicts } = require('../utils/conflict-helper');
const { formatFilingDates } = require('../utils/timeformat-helper');
const { checkMissingInvoices } = require('../utils/missinginvoice-helper');
const { addinvoicestobefiledagain } = require('../utils/refilinginvoice-helper.js');
const { applyITCOffsets } = require('../utils/itc-balance-helper.js');
function formatDate(d) {
    const date = new Date(d);
    date.setDate(date.getDate());
    return date.toISOString().split('T')[0];
}

async function fileGstService(payload) {
    const { gstin, timeframe } = payload;

    let vendor = await findVendorByGstin(gstin);
    if (!vendor) {
        if (!vendor) {
            return { status: 403, error: 'Vendor Not Registered for the service' };
        }
    }
    // console.log(vendor);
    if (!VALID_TIMEFRAMES.includes(timeframe)) {
        return {
            status: 400,
            error: `Invalid timeframe. Must be one of: ${VALID_TIMEFRAMES.join(', ')}`,
        };
    }
    const { merchant_type, state, is_itc_optedin, turnover } = vendor;
    const { startDate, endDate, dueDate, isLate } = getTimeframeRange(timeframe, state);
    console.log({ startDate, endDate, dueDate, isLate });
    const resultfromdb = await getFilingsByGstin(gstin);
    console.log(`Existing filings for ${gstin}:`, resultfromdb);
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

    let filteredData = filterInvoices(invoice, startDate, endDate, gstin);
    if (filteredData.length === 0) {
        return {
            status: 404,
            error: 'No invoices found for the specified date range and GSTIN.',
        };

    }

    const missingCheck = checkMissingInvoices(filteredData);
    if (missingCheck) {
        return missingCheck;
    }
    const refilinginvoice = await getInvoicesToBeFiledAgain(gstin);
    if (refilinginvoice.length > 0) {   
        const revisedInvoices = await addinvoicestobefiledagain(refilinginvoice, gstin);
        filteredData = [...filteredData, ...revisedInvoices];
    }

    const res = calculateGSTSummary(filteredData, merchant_type, dueDate, timeframe, turnover, is_itc_optedin);
    const { igst, cgst, sgst } = res.itc_breakdown || {};
    const { igst: tax_igst, cgst: tax_cgst, sgst: tax_sgst } = res.tax_due || {};
    // console.log(`Each Tax breakdown: IGST: ${tax_igst}, CGST: ${tax_cgst}, SGST: ${tax_sgst}`);

    await insertLedgerTransaction({ gstin, txn_type: 'CREDIT', igst, cgst, sgst });
    await upsertBalance(gstin, igst, cgst, sgst);

    const {
        payableIGST, // future use
        payableCGST, // future use
        payableSGST, // future use
        totalPayable
    } = await applyITCOffsets(gstin, { igst: tax_igst, cgst: tax_cgst, sgst: tax_sgst });


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
        taxPayable: totalPayable,
        penalty: Number(res.penalty.toFixed(2)),
        totalPayableAmount: Number((totalPayable + res.penalty).toFixed(2))
    });

    await addInvoices(gstFiling.id, filteredData);

    cache.del('filings_with_invoices_all');
    cache.del(`filings_with_invoices_${gstin}`);

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
