# GST Service API Documentation (Updated for Encrypt Branch)

## Base URL
```
http://localhost:3000
```

## Table of Contents
1. [Health Check](#health-check)
2. [Vendor Management](#vendor-management)
3. [GST Filing](#gst-filing)
4. [Invoice Management](#invoice-management)
5. [Ledger Management](#ledger-management)
6. [Error Codes](#error-codes)

---

## Authentication

All endpoints require API key authentication via the `Authorization` header:
- **Default API Key**: For admin operations (vendors, filings overview)
- **Vendor-specific API Key**: For vendor-specific operations (generated during vendor creation)

---

## Health Check

### GET /
**Description:** Check if the GST Filing Service is running.

**cURL:**
```bash
curl -X GET http://localhost:3000/
```

**Parameters:** None

**Response:**
```json
{
  "status": "GST Filing Service is up and running 🚀"
}
```

---

## Vendor Management

### GET /vendors
**Description:** Retrieve all vendors in the system.

**cURL:**
```bash
curl -X GET http://localhost:3000/vendors \
  -H "Authorization: your-default-api-key"
```

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "vendors_count": 3,
  "data": [
    {
      "gstin": "29ABCDE1234F2Z5",
      "name": "ABC Electronics",
      "merchant_type": "retailers",
      "state": "Karnataka",
      "turnover": 50000000,
      "is_itc_optedin": true,
      "email": "vendor@example.com",
      "api_key": "vendor-specific-api-key-64-chars",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### POST /vendors
**Description:** Create a vendor.

**cURL:**
```bash
curl -X POST http://localhost:3000/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: your-default-api-key" \
  -d '{
    "gstin": "29ABCDE1234F2Z5",
    "name": "ABC Electronics",
    "merchant_type": "retailers",
    "state": "Karnataka",
    "turnover": 50000000,
    "is_itc_optedin": true,
    "email": "vendor@example.com"
  }'
```

**Payload:**
```json
{
  "gstin": "29ABCDE1234F2Z5",
  "name": "ABC Electronics",
  "merchant_type": "retailers",
  "state": "Karnataka",
  "turnover": 50000000,
  "is_itc_optedin": true,
  "email": "vendor@example.com"
}
```

**Field Definitions:**
- `gstin` (required): 15-character GST identification number
- `name` (required): Vendor business name
- `merchant_type` (required): One of ["manufacturers", "retailers", "wholesellers"]
- `state` (required): State where vendor is registered
- `turnover` (required): Annual turnover amount (number)
- `is_itc_optedin` (required): Boolean indicating ITC opt-in status
- `email` (required): Vendor email for notifications (Should be registered with email service)

**Success Response (201/200):**
```json
{
    "success": true,
    "message": "Vendor created successfully",
    "data": {
        "api_key": "generated-64-character-api-key",
        "secret_key": "generated-64-character-secret-key"
    }
}
```

---

## GST Filing

### POST /gst
**Description:** File GST return for a specific timeframe and vendor.

**cURL:**
```bash
curl -X POST http://localhost:3000/gst \
  -H "Content-Type: application/json" \
  -H "Authorization: vendor-specific-api-key" \
  -d '{
    "gstin": "29ABCDE1234F2Z5",
    "timeframe": "monthly"
  }'
```

**Payload:**
```json
{
  "gstin": "29ABCDE1234F2Z5",
  "timeframe": "monthly",
}
```

**Payload Field Definitions:**
- `gstin` (required): 15-character GST identification number
- `timeframe` (required): One of ["monthly", "quarterly", "annual"]

**Success Response (200):**
```json
{
  "status": 200,
  "message": "GST filing successful.",
  "data": {
    "id": 1,
    "gstin": "29ABCDE1234F2Z5",
    "timeframe": "monthly",
    "filing_start_date": "2024-12-01",
    "filing_end_date": "2024-12-31",
    "due_date": "2025-01-20",
    "is_late": false,
    "total_amount": 125000.50,
    "total_tax": 22500.09,
    "invoice_count": 15,
    "input_tax_credit": 5000.00,
    "tax_payable": 17500.09,
    "penalty": 0.00,
    "total_payable_amount": 17500.09,
    "status": "FILED",
    "filed_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Conflict Response (409):**
```json
{
    "status": 409,
    "message": "Filing already exists for this timeframe.",
    "data": {
        "gstin": "33LMNOP9876W4X2",
        "timeframe": "quarterly",
        "filing_start_date": "2025-04-01",
        "filing_end_date": "2025-06-30",
        "total_amount": "271511",
        "total_tax": "41416",
        "invoice_count": 3,
        "filed_at": "2025-07-17T12:27:19.933Z",
        "status": "PENDING",
        "input_tax_credit": "8750.66",
        "tax_payable": "32665.34",
        "penalty": "0",
        "total_payable_amount": "32665.34",
        "due_date": "2025-07-22",
        "is_late": false
    }
}
```

### GET /gst/filings-with-invoices
**Description:** Get all GST filings with their associated invoices and products.

**cURL:**
```bash
curl -X GET http://localhost:3000/gst/filings-with-invoices \
  -H "Authorization: your-default-api-key"
```

**Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "filings_count": 2,
  "data": [
    {
      "gstin": "29ABCDE1234F2Z5",
      "vendor_name": "ABC Electronics",
      "timeframe": "monthly",
      "filing_start_date": "2024-12-01",
      "filing_end_date": "2024-12-31",
      "due_date": "2025-01-20",
      "filed_at": "2025-01-15T10:30:00.000Z",
      "is_late": false,
      "status": "FILED",
      "total_amount": 125000.50,
      "total_tax": 22500.09,
      "invoice_count": 2,
      "input_tax_credit": 5000.00,
      "tax_payable": 17500.09,
      "penalty": 0.00,
      "total_payable_amount": 17500.09,
      "invoices": [
        {
          "invoice_id": "INV001",
          "date": "2024-12-15",
          "amount": 10000.00,
          "buying_price": 8500.00,
          "cgst": 900.00,
          "sgst": 900.00,
          "igst": 0.00,
          "state": "Karnataka",
          "net_amount": 11800.00,
          "itc": 765.00,
          "status": "PAID",
          "payment_status": "COMPLETED",
          "amount_paid": 11800.00,
          "products": [
            {
              "sku": "ELEC001",
              "product_name": "Wireless Mouse",
              "category": "Electronics",
              "unit_price": 1000.00,
              "quantity": 10,
              "discount_percent": 0.00,
              "price_after_discount": 10000.00,
              "cgst": 900.00,
              "sgst": 900.00,
              "igst": 0.00,
              "buying_price": 850.00
            }
          ]
        }
      ]
    }
  ]
}
```

### GET /gst/filings-with-invoices/:gstin
**Description:** Get GST filings with invoices for a specific GSTIN.

**cURL:**
```bash
curl -X GET http://localhost:3000/gst/filings-with-invoices/29ABCDE1234F2Z5 \
  -H "Authorization: your-default-api-key"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Response:** Same structure as `/gst/filings-with-invoices` but filtered for the specific GSTIN.

---

## Invoice Management

### GET /invoice/:gstin
**Description:** Get all invoices for a specific GSTIN.

**cURL:**
```bash
curl -X GET http://localhost:3000/invoice/29ABCDE1234F2Z5 \
  -H "Authorization: vendor-specific-api-key"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Success Response (200):**
```json
{
  "success": true,
  "invoice_count": 5,
  "data": [
    {
      "id": 1,
      "gst_filing_id": 1,
      "invoice_id": "INV001",
      "date": "2024-12-15T00:00:00.000Z",
      "amount": 10000.00,
      "buying_price": 8500.00,
      "cgst": 900.00,
      "sgst": 900.00,
      "igst": 0.00,
      "state": "Karnataka",
      "net_amount": 11800.00,
      "itc": 765.00,
      "status": "PAID",
      "payment_status": "COMPLETED",
      "amount_paid": 11800.00,
      "is_filed": true,
      "is_to_be_filed_again": false,
      "is_credit_note_added": false
    }
  ]
}
```

### PATCH /invoice/:gstin/:invoice_id
**Description:** Update invoice status and payment status.

**cURL:**
```bash
curl -X PATCH http://localhost:3000/invoice/29ABCDE1234F2Z5/INV001 \
  -H "Content-Type: application/json" \
  -H "Authorization: vendor-specific-api-key" \
  -d '{
    "status": "REFUNDED",
    "payment_status": "REFUNDED"
  }'
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number
- `invoice_id` (path parameter): Invoice identifier

**Payload:**
```json
{
  "status": "REFUNDED",
  "payment_status": "REFUNDED"
}
```

**Allowed Values:**
- `status`: ["PAID", "NOTPAID", "PARTIALLY_PAID", "CANCELLED", "RETURNED", "REFUNDED"]
- `payment_status`: ["COMPLETED", "PARTIAL", "NOTPAID", "REFUNDED", "ON_HOLD"]

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invoice updated successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid field(s) in payload: invalid_field. Only 'status' and 'payment_status' are allowed."
}
```

### GET /invoice/pending/:gstin
**Description:** Get pending invoices for a specific GSTIN.

**cURL:**
```bash
curl -X GET http://localhost:3000/invoice/pending/29ABCDE1234F2Z5 \
  -H "Authorization: vendor-specific-api-key"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Success Response (200):**
```json
{
  "success": true,
  "invoice_count": 3,
  "data": [
    {
      "invoice_id": "INV001",
      "invoice_date": "2024-12-15T00:00:00.000Z",
      "total_amount": 11800.00,
      "paid_amount": 5000.00,
      "remaining_amount": 6800.00,
      "days_since_issued": 25
    }
  ]
}
```

---

## Ledger Management

### GET /ledger/:gstin
**Description:** Get ledger transaction logs for a specific GSTIN.

**cURL:**
```bash
curl -X GET http://localhost:3000/ledger/29ABCDE1234F2Z5 \
  -H "Authorization: vendor-specific-api-key"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Success Response (200):**
```json
{
  "success": true,
  "ledger_entries": 5,
  "data": [
    {
      "id": 1,
      "gstin": "29ABCDE1234F2Z5",
      "txn_type": "CREDIT",
      "igst": 1500.00,
      "cgst": 750.00,
      "sgst": 750.00,
      "txn_reason": "ITC CLAIM",
      "effective_from": "2024-12-15T00:00:00.000Z",
      "txn_date": "2024-12-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "gstin": "29ABCDE1234F2Z5",
      "txn_type": "DEBIT",
      "igst": 500.00,
      "cgst": 250.00,
      "sgst": 250.00,
      "txn_reason": "ITC CLAIM",
      "effective_from": "2024-12-15T00:00:00.000Z",
      "txn_date": "2024-12-15T11:00:00.000Z"
    }
  ]
}
```

**Field Definitions:**
- `txn_type`: Transaction type ["CREDIT", "DEBIT"]
- `igst/cgst/sgst`: Tax amounts for respective tax types
- `txn_reason`: Reason for transaction ["ITC CLAIM", "REFUNDED INVOICE", etc.]
- `effective_from`: Date from which the credit/debit is effective
- `txn_date`: Timestamp when transaction was recorded

### GET /ledger/balance/:gstin
**Description:** Get current ITC balance for a specific GSTIN.

**cURL:**
```bash
curl -X GET http://localhost:3000/ledger/balance/29ABCDE1234F2Z5 \
  -H "Authorization: vendor-specific-api-key"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "gstin": "29ABCDE1234F2Z5",
    "igst_balance": 1000.00,
    "cgst_balance": 500.00,
    "sgst_balance": 500.00,
    "updated_at": "2024-12-15T10:30:00.000Z"
  }
}
```

### GET /ledger/credit-notes/:gstin
**Description:** Get credit notes for a specific GSTIN.

**cURL:**
```bash
curl -X GET http://localhost:3000/ledger/credit-notes/29ABCDE1234F2Z5 \
  -H "Authorization: vendor-specific-api-key"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Success Response (200):**
```json
{
  "success": true,
  "credit_notes_count": 2,
  "data": [
    {
      "id": 1,
      "gstin": "29ABCDE1234F2Z5",
      "invoice_ref_id": 1,
      "invoice_id": "INV001",
      "invoice_date": "2024-12-15T00:00:00.000Z",
      "credit_note_date": "2024-12-20T00:00:00.000Z",
      "reason": "REFUND",
      "amount": -10000.00,
      "cgst": 900.00,
      "sgst": 900.00,
      "igst": 0.00,
      "net_amount": -11800.00
    }
  ]
}
```

**Credit Note Reasons:**
- `REFUND`: Product/service refunded
- `CANCELLED_INVOICE`: Invoice was cancelled
- `RETURN`: Product returned
- `OTHER`: Other reasons

---

## Error Codes

### Common HTTP Status Codes

**200 - Success**
- Request processed successfully

**201 - Created**
- Resource created successfully (vendor creation)

**400 - Bad Request**
- Invalid input parameters
- Missing required fields
- Invalid field values

**401 - Unauthorized**
- Invalid or missing API key

**403 - Forbidden**
- API key doesn't match GSTIN
- Vendor not registered for service

**404 - Not Found**
- Resource not found (invoices, filings, etc.)

**409 - Conflict**
- Filing already exists for the timeframe
- Overlapping filing periods

**500 - Internal Server Error**
- Database connection issues
- Unexpected server errors

### Common Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

---

## Business Logic Notes

### Filing Timeframes
- **Monthly**: Previous month (1st to last day)
- **Quarterly**: Previous quarter (3 months)
- **Annual**: Previous financial year (April 1 to March 31)

### Due Dates
- **Monthly**: 20th of following month
- **Quarterly**: 22nd (South/West states) or 24th (other states) of month following quarter end
- **Annual**: December 31st of following financial year

### ITC Eligibility
- **Wholesellers/Retailers**: 
  - Monthly filing: Turnover > ₹5 crores OR opted-in
  - Quarterly filing: Turnover ≤ ₹5 crores AND opted-in
- **Manufacturers**: Always eligible

### Status Combinations
Valid combinations of `status` and `payment_status`:
- `PAID` + `COMPLETED`
- `NOTPAID` + `NOTPAID`
- `PARTIALLY_PAID` + `PARTIAL`
- `CANCELLED` + `NOTPAID` (suppliers unpaid)
- `CANCELLED` + `REFUNDED` (suppliers paid)
- `RETURNED` + `REFUNDED`
- `RETURNED` + `ON_HOLD`
- `REFUNDED` + `REFUNDED`

### Penalty Calculation
- **Monthly/Quarterly**: ₹20/day (nil return) or ₹50/day (regular), max ₹5,000
- **Annual**: ₹200/day, max 0.5% of turnover

---

## Automated Processes

### Cron Jobs
- **Pending Invoice Reminders**: Runs monthly on 1st at 9 AM
- Sends email notifications for pending invoices to vendors

### Database Schema
The service uses PostgreSQL with the following main tables:
- `vendors`: Vendor information with API keys
- `gst_filings`: GST filing records
- `invoices`: Invoice details
- `products`: Product line items
- `credit_ledger`: ITC transaction log
- `credit_balances`: Current ITC balances
- `credit_notes`: Credit note records
- `invoice_tracker`: Last invoice ID tracking
- `invoice_to_be_filed_again`: Modified invoices for re-filing

### Authentication System
- **Default API Key**: For admin operations (stored in environment variable)
- **Vendor-specific API Keys**: Generated during vendor creation (64-character random keys)
- **GSTIN-based Authorization**: Ensures vendors can only access their own data
- **Middleware Protection**: All routes protected with appropriate authentication middleware