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
        // to: 'vendor1@gmail.com',
        from: 'gstservice@gmail.com',
        to: email,
        subject: `Pending Invoice Reminder [GSTIN: ${gstin}]`,
        body,
        attachment: null
    };

    const headers = {
        [EMAIL_X_API_KEY_FIELD]: process.env.EMAIL_X_API_KEY
    };

    const url = `${process.env.EMAIL_SERVICE_HOST_URL}/send_email`;

    // console.log(payload);
    // console.log(`${process.env.EMAIL_SERVICE_HOST_URL}/send`);
    // console.log(headers);

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(`✅ Email sent to ${email}:`, response.status);
        return true;
    } catch (err) {
        console.error(`❌ Failed to send email to ${email}:`, err.message);
        return false;
    }
}


module.exports = { sendReminderEmail };
