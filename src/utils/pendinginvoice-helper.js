const { getPendingInvoicesByGstin, getAllVendorsforCRON } = require('../db/queries');
const { sendReminderEmail } = require('./mailsender-helper');

async function runPendingInvoiceReminderLogic() {
    const vendors = await getAllVendorsforCRON();
    const allReminders = [];

    for (const vendor of vendors) {
        const { gstin, email } = vendor;
        if (!gstin || !email) continue;

        const pendingInvoices = await getPendingInvoicesByGstin(gstin);
        if (!pendingInvoices || pendingInvoices.length === 0) continue;

        const sent = await sendReminderEmail(email, gstin, pendingInvoices);

        if (sent) {
            allReminders.push({
                gstin,
                email,
                count: pendingInvoices.length,
                invoices: pendingInvoices
            });
        }
    }
    return allReminders;
}

module.exports = { runPendingInvoiceReminderLogic };