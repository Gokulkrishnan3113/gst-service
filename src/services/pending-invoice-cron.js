const cron = require('node-cron');
const { runPendingInvoiceReminderLogic } = require('../controllers/invoice');

//  Run every day at 9 AM every month
cron.schedule('0 9 1 * *', async () => {
    // cron.schedule('* * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running pending invoice reminder cron...`);
    try {
        const data = await runPendingInvoiceReminderLogic();
        console.log(`Reminder logic completed. ${data.length} vendor(s) notified.`);
    } catch (err) {
        console.error('Cron error:', err);
    }
});
