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
        const result = await db.query(
            `INSERT INTO invoices (
                gst_filing_id, invoice_id, date, amount,
                buying_price, cgst, sgst, igst, state,net_amount,itc
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11)
            RETURNING id`,
            [
                gstFilingId,
                inv.invoice_id,
                new Date(inv.date),
                inv.amount - inv.tax?.cgst - inv.tax?.sgst - inv.tax?.igst,
                inv.buying_price || 0,
                inv.tax?.cgst || 0,
                inv.tax?.sgst || 0,
                inv.tax?.igst || 0,
                inv.state,
                inv.amount,
                inv.itc || 0
            ]
        );
        const insertedInvoiceId = result.rows[0].id;
        if (inv.products && inv.products.length > 0) {
            await addProductsForInvoice(insertedInvoiceId, inv.products);
        }
    }
}

async function addProductsForInvoice(invoiceId, products) {
    for (const product of products) {
        await db.query(
            `INSERT INTO products(
                invoice_id, sku, product_name, category,
                unit_price, quantity, discount_percent,
                price_after_discount, cgst, sgst, igst, buying_price
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                invoiceId,
                product.sku,
                product.product_name,
                product.category,
                product.unit_price,
                product.quantity,
                product.discount_percent || 0,
                product.price_after_discount,
                product.tax?.cgst || 0,
                product.tax?.sgst || 0,
                product.tax?.igst || 0,
                product.buying_price || 0
            ]
        );
    }
}


// src/db/queries.js

async function getAllFilingsWithInvoices() {
    const result = await db.query(`
        SELECT 
            f.*, 
            v.name AS vendor_name,
            i.invoice_id AS invoice_code,
            i.date AS invoice_date,
            i.amount,
            i.buying_price,
            i.cgst,
            i.sgst,
            i.igst,
            i.state,
            i.net_amount,
            i.itc,
            p.sku,
            p.product_name,
            p.category,
            p.unit_price,
            p.quantity,
            p.discount_percent,
            p.price_after_discount,
            p.cgst AS p_cgst,
            p.sgst AS p_sgst,
            p.igst AS p_igst,
            p.buying_price AS p_buying_price
        FROM gst_filings f
        LEFT JOIN invoices i ON f.id = i.gst_filing_id
        LEFT JOIN vendors v ON f.gstin = v.gstin
        LEFT JOIN products p ON i.id = p.invoice_id
        ORDER BY f.filed_at DESC, i.date
        `);

    const filingsMap = new Map();

    for (const row of result.rows) {
        const filingId = row.id;

        if (!filingsMap.has(filingId)) {
            filingsMap.set(filingId, {
                gstin: row.gstin,
                vendor_name: row.vendor_name || null,
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

        const filing = filingsMap.get(filingId);

        if (row.invoice_code) {
            let invoice = filing.invoices.find(inv => inv.invoice_id === row.invoice_code);

            if (!invoice) {
                invoice = {
                    invoice_id: row.invoice_code,
                    date: formatDate(row.invoice_date),
                    amount: row.amount,
                    buying_price: row.buying_price,
                    cgst: row.cgst,
                    sgst: row.sgst,
                    igst: row.igst,
                    state: row.state,
                    net_amount: row.net_amount,
                    itc: row.itc,
                    products: []
                };
                filing.invoices.push(invoice);
            }

            if (row.sku) {
                invoice.products.push({
                    sku: row.sku,
                    product_name: row.product_name,
                    category: row.category,
                    unit_price: row.unit_price,
                    quantity: row.quantity,
                    discount_percent: row.discount_percent,
                    price_after_discount: row.price_after_discount,
                    cgst: row.p_cgst,
                    sgst: row.p_sgst,
                    igst: row.p_igst,
                    buying_price: row.p_buying_price || 0
                });
            }
        }
    }

    // Sort invoices and products by invoice_id and sku respectively
    for (const filing of filingsMap.values()) {
        filing.invoices.sort((a, b) => a.invoice_id.localeCompare(b.invoice_id));
        for (const invoice of filing.invoices) {
            invoice.products.sort((a, b) => a.sku.localeCompare(b.sku));
        }
    }

    return Array.from(filingsMap.values());
}


async function getAllFilingsWithInvoicesByGstin(gstin) {
    const result = await db.query(`
        SELECT 
            f.*, 
            v.name AS vendor_name,
            i.invoice_id AS invoice_code,
            i.date AS invoice_date,
            i.amount,
            i.buying_price,
            i.cgst,
            i.sgst,
            i.igst,
            i.state,
            i.net_amount,
            i.itc,
            p.sku,
            p.product_name,
            p.category,
            p.unit_price,
            p.quantity,
            p.discount_percent,
            p.price_after_discount,
            p.cgst,
            p.sgst,
            p.igst,
            p.buying_price AS product_buying_price
        FROM gst_filings f
        LEFT JOIN vendors v ON f.gstin = v.gstin
        LEFT JOIN invoices i ON f.id = i.gst_filing_id
        LEFT JOIN products p ON i.id = p.invoice_id
        WHERE f.gstin = $1
        ORDER BY f.filed_at DESC, i.date
    `, [gstin]);

    const filingsMap = new Map();

    for (const row of result.rows) {
        const filingId = row.id;

        if (!filingsMap.has(filingId)) {
            filingsMap.set(filingId, {
                gstin: row.gstin,
                vendor_name: row.vendor_name || null,
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

        const filing = filingsMap.get(filingId);

        if (row.invoice_code) {
            let invoice = filing.invoices.find(inv => inv.invoice_id === row.invoice_code);
            if (!invoice) {
                invoice = {
                    invoice_id: row.invoice_code,
                    date: formatDate(row.invoice_date),
                    amount: row.amount,
                    buying_price: row.buying_price,
                    cgst: row.cgst,
                    sgst: row.sgst,
                    igst: row.igst,
                    state: row.state,
                    net_amount: row.net_amount,
                    itc: row.itc,
                    products: []
                };
                filing.invoices.push(invoice);
            }

            if (row.sku) {
                invoice.products.push({
                    sku: row.sku,
                    product_name: row.product_name,
                    category: row.category,
                    unit_price: row.unit_price,
                    quantity: row.quantity,
                    discount_percent: row.discount_percent || 0,
                    price_after_discount: row.price_after_discount,
                    tax: {
                        cgst: row.cgst,
                        sgst: row.sgst,
                        igst: row.igst
                    },
                    buying_price: row.product_buying_price || 0
                });
            }
        }
    }

    for (const filing of filingsMap.values()) {
        filing.invoices.sort((a, b) => a.invoice_id.localeCompare(b.invoice_id));
        for (const invoice of filing.invoices) {
            invoice.products.sort((a, b) => a.sku.localeCompare(b.sku));
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
    getAllFilingsWithInvoicesByGstin,
    addProductsForInvoice
};
