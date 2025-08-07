function filterInvoices(invoices, startDate, endDate, gstin) {
    const filtered = invoices.filter(invoice =>
        (!invoice.gstin || invoice.gstin === gstin) &&
        invoice.date >= startDate &&
        invoice.date <= endDate
    );
    return filtered;
}
module.exports = { filterInvoices };
