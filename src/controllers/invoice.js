const { updateInvoice,getInvoiceByGstin } = require('../db/queries');

async function updateInvoiceByIdHandler(req, res) {
    const { gstin, invoice_id } = req.params;
    const allowedFields = ['status', 'payment_status'];
    const payloadFields = Object.keys(req.body);

    // Check for invalid fields
    const invalidFields = payloadFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Invalid field(s) in payload: ${invalidFields.join(', ')}. Only 'status' and 'payment_status' are allowed.`
        });
    }

    try {
        const updated = await updateInvoice(gstin, invoice_id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Invoice not found or no changes made' });
        }
        res.status(200).json({ success: true, message: 'Invoice updated successfully' });
    } catch (err) {
        console.error('Error updating invoice:', err);
        res.status(400).json({ success: false, message: 'Update failed' });
    }
}

async function getInvoiceByGstinHandler(req, res) {
    const { gstin } = req.params;
    try {
        const invoices = await getInvoiceByGstin(gstin);
        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ success: false, message: 'No invoices found for this GSTIN' });
        }
        res.status(200).json({ success: true, invoice_count: invoices.length, data: invoices });
    } catch (err) {
        console.error('Error fetching invoices:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


module.exports = {
    updateInvoiceByIdHandler,
    getInvoiceByGstinHandler
};