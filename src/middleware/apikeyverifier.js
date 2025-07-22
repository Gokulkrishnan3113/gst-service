const { findVendorByApiKey } = require('../db/queries');
const dotenv = require('dotenv');

async function verifyVendorApiKey(req, res, next) {
    const apiKey = req.headers['authorization'];
    console.log(req.headers);

    if (!apiKey || apiKey !== process.env.VENDOR_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid vendor API key',
        });
    }

    next();
}

async function verifyDynamicApiKey(req, res, next) {
    const apiKey = req.headers['authorization'];
    console.log(req.headers);

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Missing API key',
        });
    }

    try {
        // const result = await db.query('SELECT * FROM vendors WHERE api_key = $1', [apiKey]);
        const result = await findVendorByApiKey(apiKey);
        console.log(result);

        if (!result) {
            return res.status(401).json({
                success: false,
                message: 'UnAuthorized: Invalid API key',
            });
        }

        req.vendor = result;

        next();
    } catch (err) {
        console.error('API key verification error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during API key verification',
        });
    }
}

module.exports = {
    verifyVendorApiKey,
    verifyDynamicApiKey,
};
