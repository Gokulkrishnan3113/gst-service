function calculateGSTSummary(filteredInvoices, merchantType, dueDate, timeframe, turnover, itcOptedIn) {
    let totalAmount = 0;
    let totalTax = 0;
    let inputTaxCredit = 0;

    const filingDate = new Date();

    for (const invoice of filteredInvoices) {
        const { amount, tax, buying_price, date } = invoice;
        const invoiceDate = new Date(date);

        const cgst = tax.cgst || 0;
        const sgst = tax.sgst || 0;
        const igst = tax.igst || 0;
        const invoiceTax = cgst + sgst + igst;

        totalAmount += amount;
        totalTax += invoiceTax;

        if (
            (merchantType === 'wholesellers' || merchantType === 'retailers') &&
            buying_price &&
            amount > 0
        ) {
            const invoiceFY = invoiceDate.getMonth() < 3 ? invoiceDate.getFullYear() - 1 : invoiceDate.getFullYear();
            const itcDeadline = new Date(invoiceFY + 2, 10, 30);
            const beforeDeadline = filingDate <= itcDeadline;

            let eligibleForITC = false;

            if (timeframe === 'monthly') {
                eligibleForITC = (turnover > 5_00_00_000 || itcOptedIn === true) && beforeDeadline;
            } else if (timeframe === 'quarterly') {
                eligibleForITC = (turnover <= 5_00_00_000 && itcOptedIn === true) && beforeDeadline;
            }

            if (eligibleForITC) {
                const effectiveGstRate = invoiceTax / amount;
                inputTaxCredit += buying_price * effectiveGstRate;
            }
        }
    }

    const invoiceCount = filteredInvoices.length;

    // dueDate = new Date('2025-05-30');
    const delayInDays = Math.max(0, Math.floor(
        (filingDate - new Date(dueDate)) / (1000 * 60 * 60 * 24)
    ));

    let penalty = 0;

    if (delayInDays > 0) {
        if (['monthly', 'quarterly'].includes(timeframe)) {
            const isNilReturn = totalAmount === 0 && totalTax === 0;
            const rate = isNilReturn ? 20 : 50;
            penalty = Math.min(delayInDays * rate, 5000);
        } else if (timeframe === 'annual') {
            const annualPenalty = delayInDays * 200;
            const maxAnnualPenalty = 0.005 * turnover; // 0.5%
            penalty = Math.min(annualPenalty, maxAnnualPenalty);
        }
    }

    return {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        invoiceCount,
        inputTaxCredit: parseFloat(inputTaxCredit.toFixed(2)),
        taxPayable: parseFloat((totalTax - inputTaxCredit).toFixed(2)),
        penalty: parseFloat(penalty.toFixed(2)),
    };
}

module.exports = { calculateGSTSummary };