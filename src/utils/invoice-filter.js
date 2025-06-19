function filterInvoices(invoices, startDate, endDate, gstin, lastInvoiceId = null) {
    const filtered = invoices.filter(invoice =>
        invoice.gstin === gstin &&
        invoice.date >= startDate &&
        invoice.date <= endDate
    );

    if (!lastInvoiceId) return filtered;

    // Get only invoices that come after the last one
    const sorted = filtered.sort((a, b) => a.invoice_id.localeCompare(b.invoice_id));
    const index = sorted.findIndex(inv => inv.invoice_id === lastInvoiceId);
    return index === -1 ? sorted : sorted.slice(index + 1);
}
module.exports = { filterInvoices };
