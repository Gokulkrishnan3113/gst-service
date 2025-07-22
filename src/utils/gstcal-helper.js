function calculateGSTSummary(filteredInvoices, merchantType, dueDate, timeframe, turnover, is_itc_optedin) {
    let totalAmount = 0;
    let totalTax = 0;
    let inputTaxCredit;
    let totalinputTaxCredit = 0;
    let buyingPrice = 0;
    const filingDate = new Date();

    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    // NEW: initialize ITC buckets
    let itcCGST = 0;
    let itcSGST = 0;
    let itcIGST = 0;

    for (const invoice of filteredInvoices) {
        const existingitc = invoice.itc || 0;
        // console.log('Processing invoiceeeeeeeeeeee:', invoice);

        if (
            (invoice.status === 'CANCELLED' && invoice.payment_status === 'NOTPAID') ||
            (invoice.status === 'PARTIALLY_PAID' && invoice.payment_status === 'PARTIAL') ||
            (invoice.status === 'NOTPAID' && invoice.payment_status === 'NOTPAID') ||
            (invoice.status === 'REFUNDED' && invoice.payment_status !== 'REFUNDED') ||
            (invoice.status === 'PAID' && invoice.payment_status !== 'COMPLETED')) {
            continue;
        }
        inputTaxCredit = 0;
        buyingPrice = 0;
        const { amount, date, tax = {}, products = [] } = invoice;
        const invoiceDate = new Date(date);

        const cgst = tax.cgst || 0;
        const sgst = tax.sgst || 0;
        const igst = tax.igst || 0;
        const invoiceTax = cgst + sgst + igst;
        totalCGST += cgst;
        totalSGST += sgst;
        totalIGST += igst;
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
            const { buying_price = 0, tax = {}, price_after_discount = 0, quantity = 1 } = product;

            const cgst = tax.cgst || 0;
            const sgst = tax.sgst || 0;
            const igst = tax.igst || 0;
            const prodTax = cgst + sgst + igst;

            const totalBuyPrice = buying_price * quantity;


            if (eligibleForITC && prodTax > 0 && price_after_discount > 0) {
                const effectiveGstRate = prodTax / price_after_discount;
                const productITC = totalBuyPrice * effectiveGstRate;
                inputTaxCredit += productITC;

                // Proportional ITC distribution
                itcCGST += productITC * (cgst / prodTax);
                itcSGST += productITC * (sgst / prodTax);
                itcIGST += productITC * (igst / prodTax);

                product.itc = parseFloat(productITC.toFixed(2));
            }

            buyingPrice += buying_price * quantity;
        }
        invoice.buyingPrice = parseFloat(buyingPrice.toFixed(2));
        if (existingitc >= 0) {
            invoice.itc = parseFloat(inputTaxCredit.toFixed(2));
            totalinputTaxCredit += invoice.itc;
        }
    }

    const delayInDays = Math.max(0, Math.floor(
        (filingDate - new Date(dueDate)) / (1000 * 60 * 60 * 24)
    ));

    let penalty = 0;

    if (delayInDays > 0) {
        if (['monthly', 'quarterly'].includes(timeframe)) {
            const isNilReturn = totalAmount === 0 && totalCGST === 0 && totalSGST === 0 && totalIGST === 0;
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
        // taxPayable: parseFloat((totalTax - totalinputTaxCredit).toFixed(2)),
        tax_due: {
            igst: parseFloat(totalIGST.toFixed(2)),
            cgst: parseFloat(totalCGST.toFixed(2)),
            sgst: parseFloat(totalSGST.toFixed(2))
        },
        penalty: parseFloat(penalty.toFixed(2)),
        // NEW: ITC breakup by tax type
        itc_breakdown: {
            igst: parseFloat(itcIGST.toFixed(2)),
            cgst: parseFloat(itcCGST.toFixed(2)),
            sgst: parseFloat(itcSGST.toFixed(2))
        }
    };
}

module.exports = { calculateGSTSummary };