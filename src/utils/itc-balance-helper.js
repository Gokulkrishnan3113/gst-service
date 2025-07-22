const { getClaimableBalance, upsertBalance, insertLedgerTransaction } = require('../db/queries');

async function applyITCOffsets(gstin, taxDue) {
    const balance = await getClaimableBalance(gstin);

    // console.log(`ITC Balance for GSTIN ${gstin}:`, balance);

    if (!balance) {
        console.log(`No ITC balance entry available for GSTIN ${gstin}.`);
        return {
            payableIGST: taxDue.igst,
            payableCGST: taxDue.cgst,
            payableSGST: taxDue.sgst,
            totalPayable: parseFloat((taxDue.igst + taxDue.cgst + taxDue.sgst).toFixed(2))
        };
    }

    if (balance.igst_balance === 0 || balance.cgst_balance === 0 || balance.sgst_balance === 0) {
        console.log(`No ITC balance available for GSTIN ${gstin}.`);
        return {
            payableIGST: taxDue.igst,
            payableCGST: taxDue.cgst,
            payableSGST: taxDue.sgst,
            totalPayable: parseFloat((taxDue.igst + taxDue.cgst + taxDue.sgst).toFixed(2))
        };
    }

    let remainingIGST = balance.igst_balance;
    let remainingCGST = balance.cgst_balance;
    let remainingSGST = balance.sgst_balance;

    let payableIGST = taxDue.igst;
    let payableCGST = taxDue.cgst;
    let payableSGST = taxDue.sgst;

    if (remainingCGST >= payableCGST) {
        remainingCGST -= payableCGST;
        payableCGST = 0;
    } else {
        payableCGST -= remainingCGST;
        remainingCGST = 0;
    }

    if (remainingSGST >= payableSGST) {
        remainingSGST -= payableSGST;
        payableSGST = 0;
    } else {
        payableSGST -= remainingSGST;
        remainingSGST = 0;
    }

    const totalRemaining = payableCGST + payableSGST;
    const igstCover = Math.min(remainingIGST, totalRemaining);

    if (igstCover > 0) {
        const cgstPortion = Math.min(igstCover, payableCGST);
        payableCGST -= cgstPortion;
        remainingIGST -= cgstPortion;

        const sgstPortion = igstCover - cgstPortion;
        payableSGST -= sgstPortion;
        remainingIGST -= sgstPortion;
    }

    if (remainingIGST >= payableIGST) {
        remainingIGST -= payableIGST;
        payableIGST = 0;
    } else {
        payableIGST -= remainingIGST;
        remainingIGST = 0;
    }

    const usedIGST = taxDue.igst - payableIGST;
    const usedCGST = taxDue.cgst - payableCGST;
    const usedSGST = taxDue.sgst - payableSGST;

    await insertLedgerTransaction({
        gstin,
        txn_type: 'DEBIT',
        igst: usedIGST,
        cgst: usedCGST,
        sgst: usedSGST
    });

    await upsertBalance(gstin, -usedIGST, -usedCGST, -usedSGST);

    return {
        payableIGST,
        payableCGST,
        payableSGST,
        totalPayable: parseFloat((payableIGST + payableCGST + payableSGST).toFixed(2))
    };
}

module.exports = { applyITCOffsets };
