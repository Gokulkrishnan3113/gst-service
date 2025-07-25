const { getAllVendors, addVendor, updateVendor, dropVendor, findVendorByGstin } = require('../db/queries');

async function getVendors(req, res) {
    try {
        const vendors = await getAllVendors();
        res.status(200).json({ success: true, vendors_count: vendors.length, data: vendors });
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function createVendor(req, res) {
    try {
        const { gstin } = req.body;

        const existingVendor = await findVendorByGstin(gstin);

        if (existingVendor) {
            return res.status(409).json({
                success: false,
                message: 'Vendor already exists',
                data: existingVendor
            });
        }

        const newVendor = await addVendor(req.body);
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
    deleteVendor
};
