const { decrypt } = require('./encryption-helper');
const { findVendorByApiKey } = require('../db/queries'); // Adjust to your service path

async function decryptRequestBody(req, res, next) {
    const apiKey = req.headers['authorization'];
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    try {
        const vendor = await findVendorByApiKey(apiKey);
        console.log(vendor.secret_key);

        if (!vendor || !vendor.secret_key) {
            return res.status(403).json({ error: 'Invalid API Key' });
        }

        const decrypted = decrypt(req.body, vendor.secret_key);
        console.log(decrypted);

        req.body = decrypted;

        req.vendor = vendor;

        next();
    } catch (err) {
        console.error('Decryption error:', err.message);
        return res.status(400).json({ error: 'Invalid encrypted payload' });
    }
}

module.exports = { decryptRequestBody };
