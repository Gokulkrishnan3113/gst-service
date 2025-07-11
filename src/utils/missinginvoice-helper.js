function checkMissingInvoices(filteredData) {
    const invoiceNumbers = filteredData
        .map(inv => parseInt(inv.invoice_id.replace("INV", ""), 10))
        .sort((a, b) => a - b);

    const missingIds = [];

    for (let i = 0; i < invoiceNumbers.length - 1; i++) {
        let current = invoiceNumbers[i];
        let next = invoiceNumbers[i + 1];
        for (let expected = current + 1; expected < next; expected++) {
            missingIds.push(`INV${String(expected).padStart(3, '0')}`);
        }
    }

    if (missingIds.length > 0) {
        return {
            status: 400,
            error: `Missing invoices: ${missingIds.join(", ")}`
        };
    }

    return null; // No missing invoices
}

module.exports = { checkMissingInvoices };
