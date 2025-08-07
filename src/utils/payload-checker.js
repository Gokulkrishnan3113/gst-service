const { invoiceSchema } = require('../validators/invoicevalidator');
async function gstfilepayloadchecker(invoices, vendor, gstin) {
    const invoiceIds = new Set();
    const errors = [];

    for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];

        if (invoiceIds.has(invoice.invoice_id)) {
            errors.push({
                index: i,
                issues: [
                    {
                        message: `Duplicate invoice_id "${invoice.invoice_id}" found at index ${i}`
                    }
                ]
            });
            continue;
        }
        invoiceIds.add(invoice.invoice_id);

        invoice.products = invoice.products.map(p => ({
            ...p,
            vendor_type: vendor.merchant_type
        }));

        const { error } = invoiceSchema.validate(invoice, {
            abortEarly: false,
            context: {
                rootGstin: gstin
            }
        });

        if (error) {
            console.log(`Validation error for invoice at index ${i}:`, error.details);
            errors.push({
                index: i,
                issues: error.details.map(err => ({
                    message: err.message
                }))
            });
        }
    }

    return errors;
}

module.exports = {
    gstfilepayloadchecker
};