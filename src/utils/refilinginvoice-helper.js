const { insertCreditNoteForInvoice, insertLedgerTransaction, upsertBalance } = require('../db/queries');

function getNextMonthStart() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(nextMonth.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

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
            row.amount = -row.amount;
            row.itc = -row.itc;
            await insertCreditNoteForInvoice(row, gstin);
            const claimableFrom = getNextMonthStart();

            await insertLedgerTransaction({
                gstin,
                txn_type: 'CREDIT',
                cgst: -row.tax.cgst,
                sgst: -row.tax.sgst,
                igst: -row.tax.igst,
                txn_reason: 'REFUNDED INVOICE',
                effective_from: claimableFrom
            });

            await upsertBalance(
                gstin,
                -row.tax.igst,
                -row.tax.cgst,
                -row.tax.sgst
            );


        }

        revised.push(row);
    }

    return revised;
}

module.exports = { addinvoicestobefiledagain };
