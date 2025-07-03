function calculateGSTSummary(filteredInvoices, merchantType, dueDate, timeframe, turnover, is_itc_optedin) {
    let totalAmount = 0;
    let totalTax = 0;
    let inputTaxCredit;
    let totalinputTaxCredit = 0;
    let buyingPrice = 0;
    const filingDate = new Date();

    for (const invoice of filteredInvoices) {
        inputTaxCredit = 0;
        buyingPrice = 0;
        const { amount, date, tax = {}, products = [] } = invoice;
        const invoiceDate = new Date(date);

        const cgst = tax.cgst || 0;
        const sgst = tax.sgst || 0;
        const igst = tax.igst || 0;
        const invoiceTax = cgst + sgst + igst;

        totalAmount += amount;
        totalTax += invoiceTax;

        const invoiceFY = invoiceDate.getMonth() < 3 ? invoiceDate.getFullYear() - 1 : invoiceDate.getFullYear();
        const itcDeadline = new Date(invoiceFY + 2, 10, 30);
        const beforeDeadline = filingDate <= itcDeadline;

        let eligibleForITC = false;

        if (['wholesellers', 'retailers'].includes(merchantType)) {
            if (timeframe === 'monthly') {
                eligibleForITC = (turnover > 5_00_00_000 || is_itc_optedin) && beforeDeadline;
            } else if (timeframe === 'quarterly') {
                eligibleForITC = (turnover <= 5_00_00_000 && is_itc_optedin) && beforeDeadline;
            }
        }

        for (const product of products) {
            const { buying_price = 0, tax = {}, price_after_discount = 0 } = product;
            if (eligibleForITC) {
                const prodTax = (tax.cgst || 0) + (tax.sgst || 0) + (tax.igst || 0);
                const effectiveGstRate = price_after_discount > 0 ? prodTax / price_after_discount : 0;
                const productITC = buying_price * effectiveGstRate;
                inputTaxCredit += productITC;
                buyingPrice += buying_price;
                product.itc = parseFloat(productITC.toFixed(2));
            }
            else {
                buyingPrice += buying_price;
            }
        }
        invoice.itc = parseFloat(inputTaxCredit.toFixed(2));
        invoice.buyingPrice = parseFloat(buyingPrice.toFixed(2));
        totalinputTaxCredit += invoice.itc;
    }

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
            const maxAnnualPenalty = 0.005 * turnover;
            penalty = Math.min(annualPenalty, maxAnnualPenalty);
        }
    }

    return {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        invoiceCount: filteredInvoices.length,
        inputTaxCredit: parseFloat(totalinputTaxCredit.toFixed(2)),
        taxPayable: parseFloat((totalTax - totalinputTaxCredit).toFixed(2)),
        penalty: parseFloat(penalty.toFixed(2)),
    };
}

module.exports = { calculateGSTSummary };