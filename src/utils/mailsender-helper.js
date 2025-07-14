async function sendReminderEmail(email, gstin, invoices) {

    console.log(`📧 Sending full invoice reminder to ${email} (GSTIN: ${gstin})`);

    console.log(`🧾 Total pending invoices: ${invoices.length}`);
}

module.exports = { sendReminderEmail };
