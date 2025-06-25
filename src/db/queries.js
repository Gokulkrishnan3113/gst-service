const db = require('./index');
const { formatDate } = require('../utils/timeframe-helper');
async function getAllVendors() {
    const result = await db.query('SELECT * FROM vendors ORDER BY created_at DESC');
    return result.rows;
}

async function findVendorByGstin(gstin) {
    const result = await db.query('SELECT * FROM vendors WHERE gstin = $1', [gstin]);
    return result.rows[0];
}

async function addVendor(vendor) {
    const { gstin, name, merchant_type, state, turnover, is_itc_optedin } = vendor;

    const result = await db.query(
        `INSERT INTO vendors (gstin, name, merchant_type, state,turnover, is_itc_optedin)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (gstin) DO NOTHING
         RETURNING *`,
        [gstin, name, merchant_type, state, turnover, is_itc_optedin]
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

async function getAllFilings() {
    const result = await db.query(
        `SELECT gstin, timeframe, filing_start_date, 
        filing_end_date, total_amount,total_tax, invoice_count, 
        filed_at, status, input_tax_credit, tax_payable, penalty, 
        total_payable_amount, due_date, is_late FROM gst_filings ORDER BY filed_at DESC`);
    return result.rows;
}

async function getFilingsByGstin(gstin) {
    const result = await db.query(
        `SELECT gstin, timeframe, filing_start_date, 
        filing_end_date, total_amount, total_tax, invoice_count, 
        filed_at, status, input_tax_credit, tax_payable, penalty, 
        total_payable_amount, due_date, is_late FROM gst_filings
        WHERE gstin = $1 ORDER BY filed_at DESC`,
        [gstin]
    );
    return result.rows;
}

async function addGstFiling({
    gstin,
    timeframe,
    startDate,
    endDate,
    dueDate,
    isLate,
    totalAmount,
    totalTax,
    invoiceCount,
    inputTaxCredit,
    taxPayable,
    penalty,
    totalPayableAmount
}) {
    const result = await db.query(
        `INSERT INTO gst_filings (
        gstin, timeframe, filing_start_date, filing_end_date,
        due_date, is_late, total_amount, total_tax, invoice_count,
        input_tax_credit, tax_payable, penalty,
        total_payable_amount
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13)
    RETURNING *`,
        [
            gstin,
            timeframe,
            new Date(startDate),
            new Date(endDate),
            new Date(dueDate),
            isLate,
            totalAmount,
            totalTax,
            invoiceCount,
            inputTaxCredit,
            taxPayable,
            penalty,
            totalPayableAmount
        ]
    );

    return result.rows[0];
}

async function addInvoices(gstFilingId, invoices) {
    for (const inv of invoices) {
        await db.query(
            `INSERT INTO invoices (
                gst_filing_id, invoice_id, date, amount,
                buying_price, cgst, sgst, igst, state
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                gstFilingId,
                inv.invoice_id,
                new Date(inv.date),
                inv.amount,
                inv.buying_price,
                inv.tax?.cgst || 0,
                inv.tax?.sgst || 0,
                inv.tax?.igst || 0,
                inv.state
            ]
        );
    }
}

// src/db/queries.js

async function getAllFilingsWithInvoices() {
    const result = await db.query(`
        SELECT 
            f.*, 
            i.invoice_id AS invoice_code,
            i.date AS invoice_date,
            i.amount,
            i.buying_price,
            i.cgst,
            i.sgst,
            i.igst,
            i.state
        FROM gst_filings f
        LEFT JOIN invoices i ON f.id = i.gst_filing_id
        ORDER BY f.filed_at DESC, i.date
    `);

    const filingsMap = new Map();

    for (const row of result.rows) {
        const filingId = row.id;

        if (!filingsMap.has(filingId)) {
            filingsMap.set(filingId, {
                gstin: row.gstin,
                timeframe: row.timeframe,
                filing_start_date: formatDate(row.filing_start_date),
                filing_end_date: formatDate(row.filing_end_date),
                due_date: formatDate(row.due_date),
                filed_at: row.filed_at,
                is_late: row.is_late,
                status: row.status,
                total_amount: row.total_amount,
                total_tax: row.total_tax,
                invoice_count: row.invoice_count,
                input_tax_credit: row.input_tax_credit,
                tax_payable: row.tax_payable,
                penalty: row.penalty,
                total_payable_amount: row.total_payable_amount,
                invoices: []
            });
        }

        if (row.invoice_code) {
            filingsMap.get(filingId).invoices.push({
                invoice_id: row.invoice_code,
                date: formatDate(row.invoice_date),
                amount: row.amount,
                buying_price: row.buying_price,
                cgst: row.cgst,
                sgst: row.sgst,
                igst: row.igst,
                state: row.state
            });
        }
    }

    return Array.from(filingsMap.values());
}


async function getAllFilingsWithInvoicesByGstin(gstin) {
    const result = await db.query(`
        SELECT 
            f.*, 
            i.invoice_id AS invoice_code,
            i.date AS invoice_date,
            i.amount,
            i.buying_price,
            i.cgst,
            i.sgst,
            i.igst,
            i.state
        FROM gst_filings f
        LEFT JOIN invoices i ON f.id = i.gst_filing_id
        WHERE f.gstin = $1
        ORDER BY f.filed_at DESC, i.date
    `, [gstin]);

    const filingsMap = new Map();

    for (const row of result.rows) {
        const filingId = row.id;

        if (!filingsMap.has(filingId)) {
            filingsMap.set(filingId, {
                gstin: row.gstin,
                timeframe: row.timeframe,
                filing_start_date: formatDate(row.filing_start_date),
                filing_end_date: formatDate(row.filing_end_date),
                due_date: formatDate(row.due_date),
                filed_at: row.filed_at,
                is_late: row.is_late,
                status: row.status,
                total_amount: row.total_amount,
                total_tax: row.total_tax,
                invoice_count: row.invoice_count,
                input_tax_credit: row.input_tax_credit,
                tax_payable: row.tax_payable,
                penalty: row.penalty,
                total_payable_amount: row.total_payable_amount,
                invoices: []
            });
        }

        if (row.invoice_code) {
            filingsMap.get(filingId).invoices.push({
                invoice_id: row.invoice_code,
                date: formatDate(row.invoice_date),
                amount: row.amount,
                buying_price: row.buying_price,
                cgst: row.cgst,
                sgst: row.sgst,
                igst: row.igst,
                state: row.state
            });
        }
    }

    return Array.from(filingsMap.values());
}


module.exports = {
    getAllVendors,
    addVendor,
    updateVendor,
    dropVendor,
    findVendorByGstin,
    getLastInvoiceId,
    updateLastInvoiceId,
    addGstFiling,
    getAllFilings,
    getFilingsByGstin,
    addInvoices,
    getAllFilingsWithInvoices,
    getAllFilingsWithInvoicesByGstin
};
