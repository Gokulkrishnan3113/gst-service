const { getAllVendors, addVendor, updateVendor, dropVendor, findVendorByGstin, addMacsToVendor } = require('../db/queries');
const { checkifmailexists } = require('../utils/mailservice-checker')
const cache = require('../cache/cache'); // adjust path
const { normalizeMacInput, isValidMacArray } = require('../validators/macvalidator');
const VALID_MERCHANT_TYPES = ['manufacturers', 'retailers', 'wholesellers'];

async function getVendors(req, res) {
    try {
        const cacheKey = 'vendors_cache';
        const cachedVendors = cache.get(cacheKey);

        if (cachedVendors) {
            return res.status(200).json({
                success: true,
                cached: true,
                vendors_count: cachedVendors.length,
                data: cachedVendors,
            });
        }
        const vendors = await getAllVendors();
        cache.set(cacheKey, vendors, 900);
        res.status(200).json({ success: true, cached: false, vendors_count: vendors.length, data: vendors });
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function createVendor(req, res) {
    try {
        const { gstin, name, state, turnover, merchant_type, email, is_itc_optedin, mac_address } = req.body;

        if (!gstin || !name || !state || !turnover || !merchant_type || !email || !is_itc_optedin || !mac_address) {
            return res.status(400).json({
                success: false,
                message: 'Missing data fields. Required : [ gstin, name, state, turnover, merchant_type, email, is_itc_optedin, mac_address ]',
            });
        }
        if (gstin.length != 15) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GSTIN , should be 15 char length',
            });
        }
        const existingVendor = await findVendorByGstin(gstin);

        if (existingVendor) {
            return res.status(409).json({
                success: false,
                message: 'Vendor already exists',
                data: existingVendor
            });
        }

        if (!VALID_MERCHANT_TYPES.includes(merchant_type)) {
            return res.status(400).json({
                status: 400,
                error: `Invalid merchant type. Must be one of : ${VALID_MERCHANT_TYPES.join(', ')}`,
            });
        }
        const mailcheck = await checkifmailexists(email);

        if (!mailcheck) {
            return res.status(400).json({
                status: 400,
                error: `Invalid Email, ${email} not subscribed to email service`
            });
        }

        const macs = normalizeMacInput(mac_address);
        if (!isValidMacArray(macs)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid MAC address format. Must be one or more valid MAC strings like AA:BB:CC:DD:EE:FF',
            });
        }

        const newVendor = await addVendor({ ...req.body, mac_address: macs });
        cache.del('vendors_cache');
        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: newVendor
        });

    } catch (err) {
        console.error('Error creating/updating vendor:', err);
        res.status(400).json({
            success: false,
            error: 'Failed to create or update vendor',
            detail: err.message
        });
    }
}

async function appendMacToVendor(req, res) {
    try {
        const { gstin, mac_address } = req.body;

        if (!gstin || !Array.isArray(mac_address)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must include gstin and mac_address as an array',
            });
        }

        if (!isValidMacArray(mac_address)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid MAC address format. Must be valid strings like AA:BB:CC:DD:EE:FF',
            });
        }

        const updatedMacs = await addMacsToVendor(gstin, mac_address);

        return res.status(200).json({
            success: true,
            message: 'MAC address(es) added to vendor',
            data: updatedMacs
        });

    } catch (err) {
        console.error('Error appending MACs to vendor:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to add MAC address(es)',
            error: err.message
        });
    }
}


async function modifyVendor(req, res) {
    const { gstin } = req.params;
    try {
        const updated = await updateVendor(gstin, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('Error updating vendor:', err);
        res.status(400).json({ success: false, error: 'Update failed' });
    }
}
async function deleteVendor(req, res) {
    const { gstin } = req.params;
    try {
        const deleted = await dropVendor(gstin);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: deleted });
    } catch (err) {
        console.error('Error deleting vendor:', err);
        res.status(400).json({ success: false, error: 'Delete failed' });
    }
}

module.exports = {
    getVendors,
    createVendor,
    modifyVendor,
    deleteVendor,
    appendMacToVendor
};
