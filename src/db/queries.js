const db = require('./index');
const { formatDate } = require('../utils/timeframe-helper');
const crypto = require('crypto');

async function getAllVendors() {
    const result = await db.query('SELECT * FROM vendors ORDER BY created_at DESC');
    return result.rows;
}

async function findVendorByGstin(gstin) {
    const result = await db.query('SELECT * FROM vendors WHERE gstin = $1', [gstin]);
    return result.rows[0];
}

async function findVendorByApiKey(apiKey) {
    const result = await db.query('SELECT * from vendors WHERE api_key = $1', [apiKey]);
    return result.rows[0];
}

async function findVendorByApiKeyAndGstin(gstin, apiKey) {
    const result = await db.query('SELECT * FROM vendors WHERE gstin = $1 AND api_key = $2', [gstin, apiKey]);
    return result.rows[0];
}

function generateRandomKey(length = 64) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}
    
async function addVendor(vendor) {
    const { gstin, name, state, turnover, merchant_type, is_itc_optedin, email } = vendor;
    const api_key = generateRandomKey(64);
    const secret_key = generateRandomKey(64);

    const result = await db.query(`
        INSERT INTO vendors (gstin, name, state, turnover, merchant_type, is_itc_optedin, email, api_key,secret_key)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
        RETURNING api_key, secret_key;
    `, [gstin, name, state, turnover, merchant_type, is_itc_optedin, email, api_key, secret_key]);

    return result.rows[0];
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

// async function getAllFilings() {
//     const result = await db.query(
//         `SELECT gstin, timeframe, filing_start_date, 
//         filing_end_date, total_amount,total_tax, invoice_count, 
//         filed_at, status, input_tax_credit, tax_payable, penalty, 
//         total_payable_amount, due_date, is_late FROM gst_filings ORDER BY filed_at DESC`);
//     return result.rows;
// }

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
async function getInvoicesToBeFiledAgain(gstin) {
    const result = await db.query(
        `SELECT 
            inv.*, 
            inv.buying_price AS "buyingPrice",
            inv.status AS "original_status", 
            inv.payment_status AS "original_payment_status",
            updated.status AS "status", 
            updated.payment_status AS "payment_status",
            p.id AS product_id,
            p.sku,
            p.product_name,
            p.category,
            p.unit_price,
            p.quantity,
            p.discount_percent,
            p.price_after_discount,
            p.cgst AS product_cgst,
            p.sgst AS product_sgst,
            p.igst AS product_igst,
            p.buying_price AS product_buying_price,
            p.remaining_supplier_amount,
            p.supplier_payment_status
        FROM invoices inv
        JOIN gst_filings g ON inv.gst_filing_id = g.id
        JOIN invoice_to_be_filed_again updated ON updated.invoice_ref_id = inv.id
        LEFT JOIN products p ON p.invoice_id = inv.id
        WHERE g.gstin = $1
          AND inv.is_to_be_filed_again = true
        ORDER BY inv.id`,
        [gstin]
    );

    const rows = result.rows;
    const invoiceMap = new Map();

    for (const row of rows) {
        const invoiceId = row.id;

        if (!invoiceMap.has(invoiceId)) {
            invoiceMap.set(invoiceId, {
                id: row.id,
                gst_filing_id: row.gst_filing_id,
                invoice_id: row.invoice_id,
                date: row.date,
                amount: Number(row.amount) + Number(row.cgst) + Number(row.sgst) + Number(row.igst),
                buyingPrice: row.buyingPrice,
                tax :{
                    cgst: Number(row.cgst),
                    sgst: Number(row.sgst),
                    igst: Number(row.igst),
                },
                state: row.state,
                itc: Number(row.itc),
                status: row.status,
                payment_status: row.payment_status,
                original_status: row.original_status,
                original_payment_status: row.original_payment_status,
                products: []
            });
        }

        // If product data exists in the row, add it to the products array
        if (row.product_id) {
            invoiceMap.get(invoiceId).products.push({
                id: row.product_id,
                sku: row.sku,
                product_name: row.product_name,
                category: row.category,
                unit_price: Number(row.unit_price),
                quantity: Number(row.quantity),
                discount_percent: Number(row.discount_percent),
                price_after_discount: Number(row.price_after_discount),
                tax :{
                    cgst: Number(row.product_cgst),
                    sgst: Number(row.product_sgst),
                    igst: Number(row.product_igst),
                },
                buying_price: Number(row.product_buying_price),
                remaining_supplier_amount: Number(row.remaining_supplier_amount),
                supplier_payment_status: row.supplier_payment_status
            });
        }
    }

    const invoices = Array.from(invoiceMap.values());

    // Update the invoices table for all those that were processed
    for (const inv of invoices) {
        await db.query(
            `UPDATE invoices
             SET is_to_be_filed_again = false,
                 is_credit_note_added = true,
                 is_filed = true
             WHERE id = $1`,
            [inv.id]
        );
    }

    return invoices;
}




async function addInvoices(gstFilingId, invoices) {
    function shouldFileInvoice(status, paymentStatus) {
        return (
            (status === 'PAID' && paymentStatus === 'COMPLETED') ||
            (status === 'CANCELLED' && paymentStatus === 'REFUNDED') ||
            (status === 'RETURNED' && paymentStatus === 'REFUNDED') ||
            (status === 'REFUNDED' && paymentStatus === 'REFUNDED')
        );
    }
    let totalfilings = 0;
    for (const inv of invoices) {
        const status = inv.status || 'PAID';
        const paymentStatus = inv.payment_status || 'PAID';
        const isFiled = shouldFileInvoice(status, paymentStatus);
        if (isFiled) {
            totalfilings += 1;
        }
        const result = await db.query(
            `INSERT INTO invoices (
                gst_filing_id, invoice_id, date, amount,
                buying_price, cgst, sgst, igst, state,net_amount,itc,status,payment_status,amount_paid,is_filed
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12,$13,$14,$15)
            RETURNING id`,
            [
                gstFilingId,
                inv.invoice_id,
                new Date(inv.date),
                inv.amount - inv.tax?.cgst - inv.tax?.sgst - inv.tax?.igst,
                inv.buyingPrice || 0,
                inv.tax?.cgst || inv?.cgst || 0,
                inv.tax?.sgst || inv?.sgst || 0,
                inv.tax?.igst || inv?.igst || 0,
                inv.state,
                inv.amount,
                inv.itc || 0,
                status,
                paymentStatus,
                inv.amount_paid || 0,
                isFiled
            ]
        );
        const insertedInvoiceId = result.rows[0].id;
        if (inv.products && inv.products.length > 0) {
            await addProductsForInvoice(insertedInvoiceId, inv.products);
        }
        await db.query(`
            UPDATE gst_filings set invoice_count = ${totalfilings} where id = ${gstFilingId}
        `);
    }
}

async function getInvoiceByGstin(gstin){
    const result = await db.query(
        `SELECT * FROM invoices 
        where gst_filing_id = (
            SELECT id FROM gst_filings WHERE gstin = $1 LIMIT 1
        )`,
        [gstin]
    );
    return result.rows;
}

async function updateInvoice(gstin, invoiceId, fields) {
    const result = await db.query(
        `SELECT id, invoice_id FROM invoices
         WHERE invoice_id = $1
           AND gst_filing_id = (
               SELECT id FROM gst_filings WHERE gstin = $2 LIMIT 1
           )`,
        [invoiceId, gstin]
    );

    if (result.rowCount === 0) return false;

    const invoice = result.rows[0];

    await db.query(
        `UPDATE invoices
         SET is_to_be_filed_again = true
         WHERE id = $1`,
        [invoice.id]
    );

    const { status, payment_status } = fields;

    await db.query(
        `INSERT INTO invoice_to_be_filed_again (invoice_ref_id, invoice_id, status, payment_status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (invoice_ref_id)
        DO UPDATE SET
            status = EXCLUDED.status,
            payment_status = EXCLUDED.payment_status`,
        [invoice.id, invoice.invoice_id, status, payment_status]
    );



    return true;
}

async function getPendingInvoicesByGstin(gstin) {
    const result = await db.query(
        `SELECT 
            inv.invoice_id,
            inv.date as invoice_date,
            inv.amount as total_amount,
            inv.amount_paid AS paid_amount,
            (inv.amount - inv.amount_paid) AS remaining_amount,
            (CURRENT_DATE - inv.date) AS days_since_issued
         FROM invoices inv
         JOIN gst_filings gf ON inv.gst_filing_id = gf.id
         WHERE gf.gstin = $1
           AND inv.is_filed = false
           AND inv.status != 'CANCELLED'
           AND inv.payment_status != 'NOTPAID'
         ORDER BY (CURRENT_DATE - inv.date) DESC`,
        [gstin]
    );

    return result.rows;
}


async function insertCreditNoteForInvoice(invoice, gstin) {
    const creditNoteReasonMap = {
        REFUNDED: 'REFUND',
        CANCELLED: 'CANCELLED_INVOICE',
        RETURNED: 'RETURN'
    };

    const reason = creditNoteReasonMap[invoice.status] || 'OTHER';

    const cgst = Math.abs(invoice.tax.cgst || 0);
    const sgst = Math.abs(invoice.tax.sgst || 0);
    const igst = Math.abs(invoice.tax.igst || 0);
    const totalTax = cgst - sgst - igst;

    await db.query(
        `INSERT INTO credit_notes (
            gstin,
            invoice_ref_id,
            invoice_id,
            invoice_date,
            credit_note_date,
            reason,
            amount,
            cgst,
            sgst,
            igst,
            net_amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
            gstin,
            invoice.id,
            invoice.invoice_id,
            invoice.date,
            new Date(),
            reason,
            (invoice.amount - totalTax)* -1,
            cgst,
            sgst,
            igst,
            (invoice.amount) * -1
        ]
    );
}

async function getCreditNoteByGstin(gstin) {
    const result = await db.query('SELECT * FROM credit_notes WHERE gstin = $1', [gstin]);
    return result.rows;
}

async function addProductsForInvoice(invoiceId, products) {
    for (const product of products) {
        await db.query(
            `INSERT INTO products(
                invoice_id, sku, product_name, category,
                unit_price, quantity, discount_percent,
                price_after_discount, cgst, sgst, igst, buying_price,supplier_payment_status,remaining_supplier_amount
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13,$14)`,
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
                product.buying_price || 0,
                product.supplier_payment_status || 'PAID',
                product.remaining_supplier_amount || 0
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
            i.status AS invoice_status,
            i.payment_status AS invoice_payment_status,
            i.amount_paid AS invoice_amount_paid,
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
        WHERE i.is_filed = true
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
                    status: row.invoice_status,
                    payment_status: row.invoice_payment_status,
                    amount_paid: row.invoice_amount_paid,
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
            i.status AS invoice_status,
            i.payment_status AS invoice_payment_status,
            i.amount_paid AS invoice_amount_paid,
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
            p.buying_price AS product_buying_price
        FROM gst_filings f
        LEFT JOIN vendors v ON f.gstin = v.gstin
        LEFT JOIN invoices i ON f.id = i.gst_filing_id
        LEFT JOIN products p ON i.id = p.invoice_id
        WHERE f.gstin = $1 and
        i.is_filed = true
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
                    status: row.invoice_status,
                    payment_status: row.invoice_payment_status,
                    amount_paid: row.invoice_amount_paid,
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
                    cgst: row.p_cgst,
                    sgst: row.p_sgst,
                    igst: row.p_igst,
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

async function getLedgerLogs(gstin) {
    const result = await db.query(
        `SELECT * FROM credit_ledger WHERE gstin = $1 ORDER BY txn_date DESC, id DESC`,
        [gstin]
    );
    return result.rows;
}

async function insertLedgerTransaction({
    gstin,
    txn_type,
    igst = 0,
    cgst = 0,
    sgst = 0,
    txn_reason = 'ITC CLAIM',
    effective_from = new Date()
}) {
    const query = `
    INSERT INTO credit_ledger (
      gstin, txn_type, igst, cgst, sgst,txn_reason,effective_from
    ) VALUES ($1, $2, $3, $4, $5,$6,$7)
    RETURNING *
  `;
    const values = [gstin, txn_type, igst, cgst, sgst, txn_reason, effective_from];
    // console.log(`Inserting ledger transaction for GSTIN ${gstin}:`, values);
    const result = await db.query(query, values);
    return result.rows[0];
}

async function getBalance(gstin) {
    const result = await db.query(
        `SELECT * FROM credit_balances WHERE gstin = $1`,
        [gstin]
    );
    return result.rows[0] || null;
}

async function getClaimableBalance(gstin) {
    const query = `
        SELECT
            COALESCE(SUM(CASE WHEN txn_type = 'CREDIT' THEN igst ELSE -igst END), 0) AS igst_balance,
            COALESCE(SUM(CASE WHEN txn_type = 'CREDIT' THEN cgst ELSE -cgst END), 0) AS cgst_balance,
            COALESCE(SUM(CASE WHEN txn_type = 'CREDIT' THEN sgst ELSE -sgst END), 0) AS sgst_balance
        FROM credit_ledger
        WHERE gstin = $1 AND effective_from <= CURRENT_DATE;
    `;
    const result = await db.query(query, [gstin]);
    return result.rows[0];
}



async function upsertBalance(gstin, igst = 0, cgst = 0, sgst = 0) {
    const query = `
    INSERT INTO credit_balances (
      gstin, igst_balance, cgst_balance, sgst_balance
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (gstin) DO UPDATE SET
      igst_balance = credit_balances.igst_balance + EXCLUDED.igst_balance,
      cgst_balance = credit_balances.cgst_balance + EXCLUDED.cgst_balance,
      sgst_balance = credit_balances.sgst_balance + EXCLUDED.sgst_balance,
      updated_at = NOW()
    RETURNING *;
  `;
    const values = [gstin, igst, cgst, sgst];
    // console.log(`Upserting balance  for GSTIN ${gstin}:`, values);
    const result = await db.query(query, values);
    return result.rows[0];
}



module.exports = {
    getAllVendors,
    addVendor,
    updateVendor,
    dropVendor,
    findVendorByGstin,
    findVendorByApiKey,
    getLastInvoiceId,
    updateLastInvoiceId,
    addGstFiling,
    // getAllFilings,
    getFilingsByGstin,
    addInvoices,
    getAllFilingsWithInvoices,
    getAllFilingsWithInvoicesByGstin,
    addProductsForInvoice,
    updateInvoice,
    getInvoiceByGstin,
    getInvoicesToBeFiledAgain,
    insertCreditNoteForInvoice,
    getPendingInvoicesByGstin,
    getLedgerLogs,
    insertLedgerTransaction,
    getBalance,
    upsertBalance,
    getClaimableBalance,
    getCreditNoteByGstin,
    findVendorByApiKeyAndGstin
};
