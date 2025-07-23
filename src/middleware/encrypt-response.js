const { encrypt } = require('./encryption-helper');

function encryptResponse(handler) {
    return async function (req, res, next) {
        try {
            const result = await handler(req, res, next);

            const secretKey = req.vendor?.secret_key;

            if (!secretKey) {
                return res.status(500).json({ success: false, message: 'Missing secret key for encryption' });
            }

            const encrypted = encrypt(result, secretKey);

            return res.status(200).json(encrypted);
        } catch (err) {
            console.error('Error in encryptResponse:', err);
            return res.status(500).json({ success: false, message: 'Encryption failed' });
        }
    };
}

module.exports = { encryptResponse };

