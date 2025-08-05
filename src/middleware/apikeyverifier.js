const { findVendorByApiKey, findVendorByApiKeyAndGstin } = require('../db/queries');

async function verifyDefaultApiKey(req, res, next) {
    const apiKey = req.headers['authorization'];
    // console.log(req.headers);

    if (!apiKey || apiKey !== process.env.DEFAULT_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid vendor API key',
        });
    }

    next();
}

async function verifyAuth(req, res, next) {
    try {
        const apiKey = req.headers['authorization'];
        const gstin = req.params.gstin || req.body.gstin;
        const mac_address = req.headers['mac-address'];

        if (!apiKey || !gstin || !mac_address) {
            return res.status(400).json({
                success: false,
                message: 'Missing API key or GSTIN or MAC address',
            });
        }

        const result = await findVendorByApiKeyAndGstin(gstin, apiKey);

        if (!result) {
            return res.status(403).json({
                success: false,
                message: 'API key does not match the GSTIN'
            });
        }

        if (!result.mac_list.includes(mac_address)) {
            return res.status(403).json({
                success: false,
                message: 'MAC address not authorized for this GSTIN/API key'
            });
        }

        req.vendor = result;

        next();
    } catch (err) {
        console.error('Error in verifyAuth:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during GSTIN/API key check'
        });
    }
}


module.exports = {
    verifyDefaultApiKey,
    verifyAuth

};
