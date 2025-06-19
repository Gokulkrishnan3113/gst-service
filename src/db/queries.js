const db = require('./index');

async function getAllVendors() {
    const result = await db.query('SELECT * FROM vendors ORDER BY created_at DESC');
    return result.rows;
}

async function findVendorByGstin(gstin) {
    const result = await db.query('SELECT * FROM vendors WHERE gstin = $1', [gstin]);
    return result.rows[0];
}

async function addVendor(vendor) {
    const { gstin, name, merchant_type, state } = vendor;

    const result = await db.query(
        `INSERT INTO vendors (gstin, name, merchant_type, state)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (gstin) DO NOTHING
         RETURNING *`,
        [gstin, name, merchant_type, state]
    );

    // If gstin existed already, result.rows[0] will be undefined
    return result.rows[0] || null;
}

async function updateVendor(gstin, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    // Build dynamic SET clause
    const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');

    const result = await db.query(
        `UPDATE vendors SET ${setClause} WHERE gstin = $1 RETURNING *`,
        [gstin, ...values]
    );
    return result.rows[0];
}

async function dropVendor(gstin) {
    const result = await db.query(
        'DELETE FROM vendors WHERE gstin = $1 RETURNING *',
        [gstin]
    );
    return result.rows[0];
}

async function getLastInvoiceId(gstin) {
    const result = await db.query(
        `SELECT last_invoice_id FROM invoice_tracker WHERE gstin = $1`,
        [gstin]
    );
    return result.rows[0]?.last_invoice_id || null;
}

async function updateLastInvoiceId(gstin, lastId) {
    await db.query(
        `INSERT INTO invoice_tracker (gstin, last_invoice_id)
        VALUES ($1, $2)
        ON CONFLICT (gstin)
        DO UPDATE SET last_invoice_id = EXCLUDED.last_invoice_id, updated_at = NOW()`,
        [gstin, lastId]
    );
}

module.exports = {
    getAllVendors,
    addVendor,
    updateVendor,
    dropVendor,
    findVendorByGstin,
    getLastInvoiceId,
    updateLastInvoiceId
};
