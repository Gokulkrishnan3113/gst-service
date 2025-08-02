const axios = require('axios');
const { mailencrypt, maildecrypt } = require('./mailservice-encryption-helper')
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
    const sender_secret = process.env.EMAIL_X_CLIENT_SECRET_VALUE;
    const payload = {
        // to: 'mokobara@gmail.com',
        from: 'gstservice@gmail.com',
        to: email,
        subject: `Pending Invoice Reminder [GSTIN: ${gstin}]`,
        body,
        attachment: null
    };
    //console.log(payload);

    const encryptedData = mailencrypt(payload, sender_secret);

    const headers = {
        [process.env.EMAIL_X_API_KEY_FIELD]: process.env.EMAIL_X_API_KEY_VALUE,
        'Content-Type': 'application/json',
        [process.env.EMAIL_X_CLIENT_SECRET_FIELD]: process.env.EMAIL_X_CLIENT_SECRET_VALUE
    };

    //console.log(headers);

    const url = `${process.env.EMAIL_SERVICE_HOST_URL}/service/send_email`;

    //console.log(url);

    //console.log(encryptedData);

    const encryptedPayload = {
        encrypted_data: encryptedData,
        user_email: 'gstservice@gmail.com'
    };
    try {
        const response = await axios.post(url, encryptedPayload, { headers });
        // console.log(response.data);
        // const decryptedData = maildecrypt(response.data.decrypted_response, sender_secret);
        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to send email to ${email}:`, err.message);
        return false;
    }
}


module.exports = { sendReminderEmail };
