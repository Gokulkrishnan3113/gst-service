const { updateInvoice, getInvoiceByGstin, getPendingInvoicesByGstin, getAllVendors } = require('../db/queries');
const { runPendingInvoiceReminderLogic } = require('../utils/pendinginvoice-helper')
async function updateInvoiceByIdHandler(req, res) {
    const { gstin, invoice_id } = req.params;
    const allowedFields = ['status', 'payment_status'];
    const payloadFields = Object.keys(req.body);

    // Check for invalid fields
    const invalidFields = payloadFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        return {
            status: 400,
            success: false,
            message: `Invalid field(s) in payload: ${invalidFields.join(', ')}. Only 'status' and 'payment_status' are allowed.`
        };
    }

    try {
        const updated = await updateInvoice(gstin, invoice_id, req.body);
        if (!updated) {
            return {
                status: 404,
                success: false,
                message: 'Invoice not found or no changes made'
            };
        }
        return {
            status: 200,
            success: true,
            message: 'Invoice updated successfully'
        };
    } catch (err) {
        console.error('Error updating invoice:', err);
        return {
            status: 400,
            success: false,
            message: 'Update failed'
        };
    }
}

async function getInvoiceByGstinHandler(req, res) {
    const { gstin } = req.params;
    try {
        const invoices = await getInvoiceByGstin(gstin);
        if (!invoices || invoices.length === 0) {
            return {
                status: 404,
                success: false,
                message: 'No invoices found for this GSTIN'
            };
        }
        return {
            status: 200,
            success: true,
            invoice_count: invoices.length,
            data: invoices
        };
    } catch (err) {
        console.error('Error fetching invoices:', err);
        return {
            status: 500,
            success: false,
            message: 'Internal Server Error'
        };
    }
}

async function getPendingInvoicesHandler(req, res) {
    const { gstin } = req.params;

    try {
        const invoices = await getPendingInvoicesByGstin(gstin);

        if (invoices.length === 0) {
            return {
                status: 404,
                success: false,
                message: 'No pending invoices found for this GSTIN'
            };
        }

        return {
            status: 200,
            success: true,
            invoice_count: invoices.length,
            data: invoices
        };
    } catch (err) {
        console.error('Error fetching pending invoices:', err);
        return {
            status: 500,
            success: false,
            message: 'Internal server error'
        };
    }
}


async function triggerPendingInvoiceReminder(req, res) {
    try {
        const data = await runPendingInvoiceReminderLogic();

        if (!data || data.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No email reminders sent. All vendors skipped or email failed.',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reminder logic executed successfully',
            data
        });

    } catch (err) {
        console.error('Error running reminder logic:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while running reminder logic'
        });
    }
}



module.exports = {
    updateInvoiceByIdHandler,
    getInvoiceByGstinHandler,
    getPendingInvoicesHandler,
    triggerPendingInvoiceReminder
};