const axios = require('axios');
const dotenv = require('dotenv');

function buildEmailBody(gstin, invoices) {
    let text = `Hello,\n\nYou have ${invoices.length} pending invoice(s) for GSTIN: ${gstin}.\n\n`;

    text += 'Details:\n';
    invoices.forEach(inv => {
        text += `\nInvoice ID: ${inv.invoice_id}
                    Date: ${new Date(inv.invoice_date).toLocaleDateString('en-IN')}
                    Total: ₹${inv.total_amount}
                    Paid: ₹${inv.paid_amount}
                    Remaining: ₹${inv.remaining_amount}
                    Days Since Issued: ${inv.days_since_issued}\n`;
    });

    text += '\nPlease ensure timely payment.\n\nRegards,\nGST Filing Service';

    return text;
}

async function sendReminderEmail(email, gstin, invoices) {
    const body = buildEmailBody(gstin, invoices);

    const payload = {
        token: process.env.EMAIL_SERVICE_TOKEN,
        to: 'danu@gmail.com',
        // to: email,
        subject: `Pending Invoice Reminder [GSTIN: ${gstin}]`,
        body,
        attachment: null
    };

    try {
        const response = await axios.post('http://127.0.0.1:3000/send', payload);
        console.log(`✅ Email sent to ${email}:`, response.status);
        return true;
    } catch (err) {
        console.error(`❌ Failed to send email to ${email}:`, err.message);
        return false;
    }
}


module.exports = { sendReminderEmail };
