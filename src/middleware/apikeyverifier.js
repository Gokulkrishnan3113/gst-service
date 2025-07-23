const { findVendorByApiKey, findVendorByApiKeyAndGstin } = require('../db/queries');
const dotenv = require('dotenv');

async function verifyDefaultApiKey(req, res, next) {
    const apiKey = req.headers['authorization'];
    console.log(req.headers);

    if (!apiKey || apiKey !== process.env.DEFAULT_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid vendor API key',
        });
    }

    next();
}

async function verifyGstinWithApiKey(req, res, next) {
    try {
        const apiKey = req.headers['authorization'];
        const gstin = req.params.gstin || req.body.gstin;

        if (!apiKey || !gstin) {
            return res.status(400).json({
                success: false,
                message: 'Missing API key or GSTIN'
            });
        }

        const result = await findVendorByApiKeyAndGstin(gstin, apiKey);

        if (!result) {
            return res.status(403).json({
                success: false,
                message: 'API key does not match the GSTIN'
            });
        }

        next();
    } catch (err) {
        console.error('🔒 Error in verifyGstinWithApiKey:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during GSTIN/API key check'
        });
    }
}


module.exports = {
    verifyDefaultApiKey,
    verifyGstinWithApiKey

};
