const Joi = require('joi');

const invoiceSchema = Joi.object({
    invoice_id: Joi.string().required(),
    gstin: Joi.string().custom((invoiceGstin, helpers) => {
        const rootGstin = helpers?.prefs?.context?.rootGstin;
        const fieldPath = helpers?.path?.join('.') || 'gstin';

        if (invoiceGstin !== rootGstin) {
            return helpers.message(
                `"${fieldPath}" must match root gstin "${rootGstin}", but found "${invoiceGstin}"`
            );
        }

        return invoiceGstin;
    }),



    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    amount: Joi.number().required(),

    tax: Joi.object({
        cgst: Joi.number().required(),
        sgst: Joi.number().required(),
        igst: Joi.number().required()
    }).required(),

    state: Joi.string(),
    vendor_type: Joi.string().valid("manufacturers", "retailers", "wholesellers"),
    buyer_type: Joi.string(),

    products: Joi.array().items(
        Joi.object({
            sku: Joi.string().required(),
            product_name: Joi.string().required(),
            category: Joi.string().required(),
            unit_price: Joi.number().required(),
            quantity: Joi.number().required(),
            discount_percent: Joi.number().required(),
            price_after_discount: Joi.number().required(),

            tax: Joi.object({
                cgst: Joi.number().required(),
                sgst: Joi.number().required(),
                igst: Joi.number().required()
            }).required(),

            supplier_payment_status: Joi.string().valid("PAID", "NOTPAID", "UNPAID", "PARTIALLY_PAID").required(),

            remaining_supplier_amount: Joi.number().allow(null).when('supplier_payment_status', {
                is: "PAID",
                then: Joi.valid(0),
                otherwise: Joi.number().greater(0).required()
            }),

            vendor_type: Joi.string().valid("manufacturers", "retailers", "wholesellers").required(),

            buying_price: Joi.when('vendor_type', {
                is: "manufacturers",
                then: Joi.forbidden(),
                otherwise: Joi.number().required()
            }),

            raw_materials_cost: Joi.when('vendor_type', {
                is: "manufacturers",
                then: Joi.number().required(),
                otherwise: Joi.forbidden()
            })
        })
    ).required(),

    status: Joi.string().valid("PAID", "PARTIALLY_PAID", "CANCELLED", "RETURNED", "REFUNDED", "NOTPAID").required(),
    payment_status: Joi.string().valid("COMPLETED", "PARTIAL", "NOTPAID", "REFUNDED", "ON_HOLD").required(),
    amount_paid: Joi.number().required()
}).custom((value, helpers) => {

    const { status, payment_status, amount, amount_paid, products } = value;

    const allSuppliersPaid = products.every(p => p.supplier_payment_status === "PAID");
    const allSuppliersUnpaid = products.every(p => p.supplier_payment_status === "NOTPAID");

    // 1. status :: payment_status :: amount_paid
    if (status === "PAID" && payment_status !== "COMPLETED") {
        return helpers.message("PAID status must have COMPLETED payment_status");
    }
    if (status === "PAID" && amount_paid !== amount) {
        return helpers.message("PAID must have amount_paid equal to amount");
    }

    if (status === "NOTPAID" && (payment_status !== "NOTPAID" || amount_paid !== 0)) {
        return helpers.message("status : NOTPAID must have payment_status NOTPAID and amount_paid 0");
    }

    if (status === "PARTIALLY_PAID") {
        const percent = (amount_paid / amount) * 100;
        if (payment_status !== "PARTIAL" || percent < 30 || percent > 90) {
            return helpers.message("PARTIALLY_PAID must have PARTIAL payment_status and amount_paid between 30% and 90%");
        }
    }

    if (status === "CANCELLED") {
        if (allSuppliersUnpaid && (payment_status !== "NOTPAID" || amount_paid !== 0)) {
            return helpers.message("CANCELLED with UNPAID suppliers must have NOTPAID status and amount_paid 0");
        }
        if (allSuppliersPaid && (payment_status !== "REFUNDED" || amount_paid !== amount)) {
            return helpers.message("CANCELLED with PAID suppliers must have REFUNDED payment_status and amount_paid equals amount");
        }
    }

    if (status === "RETURNED") {
        if (!["REFUNDED", "ON_HOLD"].includes(payment_status)) {
            return helpers.message("RETURNED must have REFUNDED or ON_HOLD payment_status");
        }
        if (amount_paid !== amount) {
            return helpers.message("RETURNED must have amount_paid equals amount");
        }
    }

    if (status === "REFUNDED" && (payment_status !== "REFUNDED" || amount_paid !== amount)) {
        return helpers.message("REFUNDED must have REFUNDED payment_status and amount_paid equals amount");
    }

    // 2. payment_status :: amount_paid
    if (payment_status === "COMPLETED" && amount_paid !== amount) {
        return helpers.message("COMPLETED payment_status must have amount_paid equal to amount");
    }
    if (payment_status === "PARTIAL") {
        if (!(amount_paid > 0 && amount_paid < amount)) {
            return helpers.message("PARTIAL must have 0 < amount_paid < amount");
        }
    }
    if (payment_status === "NOTPAID" && amount_paid !== 0) {
        return helpers.message("NOTPAID payment_status must have amount_paid 0");
    }
    if (["REFUNDED", "ON_HOLD"].includes(payment_status) && amount_paid !== amount) {
        return helpers.message(`${payment_status} must have amount_paid equal to amount`);
    }

    return value;
});

module.exports = { invoiceSchema };