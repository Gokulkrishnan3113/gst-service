const {insertCreditNoteForInvoice} = require('../db/queries');

async function addinvoicestobefiledagain(rawInvoices, gstin) {
    const revised = [];

    for (const row of rawInvoices) {
        console.log('Processing invoice:', row);
        
        const wasPartiallyPaid =
            row.original_status === 'PARTIALLY_PAID' &&
            row.original_payment_status === 'PARTIAL';

        const isNowFullyPaid =
            row.status === 'PAID' && row.payment_status === 'COMPLETED';

        if (wasPartiallyPaid && isNowFullyPaid) {
            revised.push(row);
            continue;
        }

        const isRefundedFlow =
            row.status === 'REFUNDED' && row.payment_status === 'REFUNDED' ||
            row.status === 'CANCELLED' && row.payment_status === 'REFUNDED' ||
            row.status === 'RETURNED' && row.payment_status === 'REFUNDED';

        const originalPaid =
            row.original_status === 'PAID' && row.original_payment_status === 'COMPLETED';

        if (isRefundedFlow && originalPaid) {
            row.tax = {
                cgst: -(row.tax.cgst || 0),
                sgst: -(row.tax.sgst || 0),
                igst: -(row.tax.igst || 0),
            };
            row.amount = -row.amount + row.tax.cgst + row.tax.sgst + row.tax.igst;
            row.itc = -row.itc;
            await insertCreditNoteForInvoice(row, gstin);

        }

        revised.push(row);
    }

    return revised;
}

module.exports = { addinvoicestobefiledagain };
