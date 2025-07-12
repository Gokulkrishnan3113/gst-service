const { updateInvoice } = require('../db/queries');

async function updateInvoiceByIdHandler(req, res) {
    const { gstin, invoice_id } = req.params;
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



module.exports = {
    updateInvoiceByIdHandler
};