const { findVendorByGstin, addVendor } = require('../db/queries');
const { getTimeframeRange } = require('../utils/timeframe-helper')
const VALID_TIMEFRAMES = ['monthly', 'quarterly', 'halfyearly', 'annual'];
const VALID_MERCHANT_TYPES = ['manufacturers', 'retailers', 'wholesellers'];

async function fileGstService(payload) {
    const { gstin, timeframe, merchant_type, name, state } = payload;

    if (!gstin || gstin.length !== 15) {
        return { status: 400, error: 'Invalid GSTIN. Must be 15 characters.' };
    }

    if (!VALID_TIMEFRAMES.includes(timeframe)) {
        return {
            status: 400,
            error: `Invalid timeframe. Must be one of: ${VALID_TIMEFRAMES.join(', ')}`,
        };
    }

    if (!VALID_MERCHANT_TYPES.includes(merchant_type)) {
        return {
            status: 400,
            error: `Invalid merchant type. Must be one of: ${VALID_MERCHANT_TYPES.join(', ')}`,
        };
    }

    // return {
    //     status: 200,
    //     message: 'Step 1 passed. Ready for Step 2: Check vendor in DB.',
    // };
    // ✅ Step 2: Check vendor, create if not found
    let vendor = await findVendorByGstin(gstin);
    if (!vendor) {
        vendor = await addVendor({ gstin, name, merchant_type, state });
        if (!vendor) {
            return { status: 500, error: 'Vendor could not be created' };
        }
    }

    const { startDate, endDate, dueDate, isLate } = getTimeframeRange(timeframe, state);
    console.log({ startDate, endDate, dueDate, isLate });

    return {
        status: 200,
        message: 'Step 2 passed (vendor exists or was created). Ready for Step 3: Determine date range.',
    };

}

module.exports = { fileGstService };
