# GST Service Architecture Diagram

## System Overview
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              GST FILING SERVICE                                 │
│                            (Node.js + Express.js)                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Web Clients  │  Mobile Apps  │  Third-party Systems  │  Admin Dashboard      │
│               │               │                       │                       │
│  HTTP/HTTPS Requests with API Key Authentication                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            Express.js Server                                   │
│                         (Port: 3000 - Configurable)                           │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   CORS Handler  │  │  Request Logger │  │  Error Handler  │                │
│  │                 │  │                 │  │                 │                │
│  │ • Cross-origin  │  │ • Timestamp     │  │ • Global catch  │                │
│  │   requests      │  │ • Method & URL  │  │ • Error format  │                │
│  │ • Headers       │  │ • IST timezone  │  │ • Status codes  │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          API Key Verification                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    verifyDefaultApiKey                                  │   │
│  │  • Admin operations (vendors, filings overview)                        │   │
│  │  • Uses DEFAULT_API_KEY from environment                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                  verifyGstinWithApiKey                                  │   │
│  │  • Vendor-specific operations                                           │   │
│  │  • Validates GSTIN + API Key combination                               │   │
│  │  • Generated during vendor creation                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               ROUTING LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            Express Route Handlers                              │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   /vendors  │  │    /gst     │  │  /invoice   │  │   /ledger   │           │
│  │             │  │             │  │             │  │             │           │
│  │ • GET /     │  │ • POST /    │  │ • GET /:id  │  │ • GET /:id  │           │
│  │ • POST /    │  │ • GET /fi.. │  │ • PATCH /.. │  │ • GET /bal..│           │
│  │             │  │             │  │ • GET /pen..│  │ • GET /cre..│           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             CONTROLLER LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          Business Logic Controllers                            │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Vendor Controller│  │ Filing Controller│  │Invoice Controller│               │
│  │                 │  │                 │  │                 │                │
│  │ • getVendors    │  │ • fileGstHandler│  │ • updateInvoice │                │
│  │ • createVendor  │  │ • getAllFilings │  │ • getInvoices   │                │
│  │ • modifyVendor  │  │ • getFilingsById│  │ • getPending    │                │
│  │ • deleteVendor  │  │ • getWithInvoice│  │ • sendReminders │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐                                                           │
│  │Ledger Controller│                                                           │
│  │                 │                                                           │
│  │ • getLedgerLogs │                                                           │
│  │ • getBalance    │                                                           │
│  │ • getCreditNotes│                                                           │
│  └─────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            Core Business Services                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        fileGstService                                   │   │
│  │  • Main GST filing orchestration                                        │   │
│  │  • Vendor validation & creation                                         │   │
│  │  • Timeframe validation & conflict detection                            │   │
│  │  • Invoice filtering & processing                                       │   │
│  │  • GST calculations & ITC processing                                    │   │
│  │  • Database transaction management                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               UTILITY LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            Helper Functions & Utils                            │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ GST Calculations│  │ Time & Dates    │  │ Data Processing │                │
│  │                 │  │                 │  │                 │                │
│  │ • calculateGST  │  │ • getTimeframe  │  │ • filterInvoices│                │
│  │ • ITC eligibility│  │ • formatDates   │  │ • detectConflict│                │
│  │ • Tax offsetting│  │ • due dates     │  │ • missingInvoice│                │
│  │ • Penalties     │  │ • state rules   │  │ • refilingHelper│                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                                     │
│  │ Email Service   │  │ ITC Balance     │                                     │
│  │                 │  │                 │                                     │
│  │ • sendReminder  │  │ • applyOffsets  │                                     │
│  │ • buildEmailBody│  │ • balanceCalc   │                                     │
│  │ • axios calls   │  │ • ledgerUpdate  │                                     │
│  └─────────────────┘  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          Database Query Functions                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                            queries.js                                   │   │
│  │                                                                         │   │
│  │  Vendor Operations:                                                     │   │
│  │  • getAllVendors, addVendor, updateVendor, dropVendor                  │   │
│  │  • findVendorByGstin, findVendorByApiKey                               │   │
│  │                                                                         │   │
│  │  Filing Operations:                                                     │   │
│  │  • addGstFiling, getAllFilings, getFilingsByGstin                      │   │
│  │  • getAllFilingsWithInvoices, getAllFilingsWithInvoicesByGstin         │   │
│  │                                                                         │   │
│  │  Invoice Operations:                                                    │   │
│  │  • addInvoices, updateInvoice, getInvoiceByGstin                       │   │
│  │  • getPendingInvoicesByGstin, getInvoicesToBeFiledAgain                │   │
│  │                                                                         │   │
│  │  Ledger Operations:                                                     │   │
│  │  • insertLedgerTransaction, getLedgerLogs                              │   │
│  │  • getBalance, upsertBalance, getClaimableBalance                      │   │
│  │                                                                         │   │
│  │  Credit Notes:                                                          │   │
│  │  • insertCreditNoteForInvoice, getCreditNoteByGstin                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              PostgreSQL Database                               │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │     vendors     │  │   gst_filings   │  │    invoices     │                │
│  │                 │  │                 │  │                 │                │
│  │ • gstin (PK)    │  │ • id (PK)       │  │ • id (PK)       │                │
│  │ • name          │  │ • gstin (FK)    │  │ • gst_filing_id │                │
│  │ • merchant_type │  │ • timeframe     │  │ • invoice_id    │                │
│  │ • state         │  │ • start/end     │  │ • amount, tax   │                │
│  │ • turnover      │  │ • total_amount  │  │ • status        │                │
│  │ • is_itc_optedin│  │ • tax_payable   │  │ • payment_status│                │
│  │ • email         │  │ • penalty       │  │ • is_filed      │                │
│  │ • api_key       │  │ • status        │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │    products     │  │  credit_ledger  │  │ credit_balances │                │
│  │                 │  │                 │  │                 │                │
│  │ • id (PK)       │  │ • id (PK)       │  │ • gstin (PK)    │                │
│  │ • invoice_id(FK)│  │ • gstin         │  │ • igst_balance  │                │
│  │ • sku           │  │ • txn_type      │  │ • cgst_balance  │                │
│  │ • product_name  │  │ • igst/cgst/sgst│  │ • sgst_balance  │                │
│  │ • category      │  │ • txn_reason    │  │ • updated_at    │                │
│  │ • unit_price    │  │ • effective_from│  │                 │                │
│  │ • quantity      │  │ • txn_date      │  │                 │                │
│  │ • buying_price  │  │                 │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │  credit_notes   │  │invoice_tracker  │  │invoice_to_be_   │                │
│  │                 │  │                 │  │filed_again      │                │
│  │ • id (PK)       │  │ • gstin (PK)    │  │ • invoice_ref_id│                │
│  │ • gstin         │  │ • last_invoice  │  │ • invoice_id    │                │
│  │ • invoice_ref_id│  │   _id           │  │ • status        │                │
│  │ • reason        │  │ • updated_at    │  │ • payment_status│                │
│  │ • amount        │  │                 │  │                 │                │
│  │ • cgst/sgst/igst│  │                 │  │                 │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          Email Service                                  │   │
│  │  • Pending invoice reminders                                            │   │
│  │  • HTTP API calls via axios                                             │   │
│  │  • Configurable via environment variables                               │   │
│  │  • Scheduled via node-cron (monthly on 1st at 9 AM)                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BACKGROUND SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Cron Job Scheduler                               │   │
│  │  • Pending Invoice Reminder Cron                                        │   │
│  │  • Schedule: '0 9 1 * *' (9 AM on 1st of every month)                  │   │
│  │  • Fetches all vendors with pending invoices                            │   │
│  │  • Sends email notifications                                            │   │
│  │  • Logs execution results                                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

1. VENDOR REGISTRATION FLOW:
   Client Request → API Key Validation → Controller → Database → Response

2. GST FILING FLOW:
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Request   │ →  │ Validation  │ →  │ Processing  │ →  │  Response   │
   │             │    │             │    │             │    │             │
   │ • GSTIN     │    │ • API Key   │    │ • Filter    │    │ • Filing ID │
   │ • Timeframe │    │ • GSTIN     │    │   Invoices  │    │ • Tax Calc  │
   │ • Merchant  │    │ • Timeframe │    │ • Calculate │    │ • Status    │
   │   Type      │    │ • Conflicts │    │   GST       │    │ • Penalties │
   │ • State     │    │ • Vendor    │    │ • ITC Calc  │    │             │
   │ • Turnover  │    │   Exists    │    │ • Save Data │    │             │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

3. INVOICE UPDATE FLOW:
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Update    │ →  │ Validation  │ →  │ Processing  │ →  │  Response   │
   │             │    │             │    │             │    │             │
   │ • Status    │    │ • API Key   │    │ • Mark for  │    │ • Success   │
   │ • Payment   │    │ • Invoice   │    │   Refiling  │    │   Status    │
   │   Status    │    │   Exists    │    │ • Credit    │    │             │
   │             │    │ • Valid     │    │   Notes     │    │             │
   │             │    │   Combo     │    │ • Ledger    │    │             │
   │             │    │             │    │   Updates   │    │             │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

4. ITC BALANCE FLOW:
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ ITC Credit  │ →  │ Calculation │ →  │ Offsetting  │ →  │ Final Tax   │
   │             │    │             │    │             │    │             │
   │ • Product   │    │ • Eligible  │    │ • CGST vs   │    │ • Payable   │
   │   Purchase  │    │   Products  │    │   CGST      │    │   Amount    │
   │ • Tax Paid  │    │ • ITC Rate  │    │ • SGST vs   │    │ • Balance   │
   │ • Buying    │    │ • Timeframe │    │   SGST      │    │   Update    │
   │   Price     │    │   Rules     │    │ • IGST      │    │ • Ledger    │
   │             │    │             │    │   Cross     │    │   Entry     │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SECURITY ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Authentication │    │   Authorization │
│                 │    │                 │    │                 │
│ • CORS Policy   │ →  │ • Default API   │ →  │ • Route-based   │
│ • Rate Limiting │    │   Key (Admin)   │    │   Access        │
│ • Request Log   │    │ • Vendor API    │    │ • GSTIN-based   │
│ • Error Handle  │    │   Key (Scoped)  │    │   Data Access   │
│                 │    │ • Key Validation│    │ • Operation     │
│                 │    │ • GSTIN Match   │    │   Permissions   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Architectural Patterns

### 1. **Layered Architecture**
- Clear separation of concerns across layers
- Each layer has specific responsibilities
- Dependencies flow downward only

### 2. **Repository Pattern**
- Database operations abstracted in queries.js
- Controllers don't directly interact with database
- Consistent data access patterns

### 3. **Service Layer Pattern**
- Complex business logic in dedicated services
- Orchestration of multiple operations
- Transaction management

### 4. **Middleware Pattern**
- Cross-cutting concerns handled by middleware
- Authentication, logging, error handling
- Reusable across routes

### 5. **Utility Pattern**
- Common functions extracted to utilities
- Reusable business logic helpers
- Date, calculation, and formatting functions

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TECHNOLOGY STACK                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Runtime:           Node.js                                                     │
│  Framework:         Express.js                                                  │
│  Database:          PostgreSQL                                                  │
│  Database Client:   pg (node-postgres)                                         │
│  HTTP Client:       axios                                                       │
│  Scheduling:        node-cron                                                   │
│  Environment:       dotenv                                                      │
│  CORS:              cors middleware                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Environment Configuration

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ENVIRONMENT VARIABLES                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  DATABASE_URL                    - PostgreSQL connection string                │
│  PORT                           - Server port (default: 3000)                 │
│  DEFAULT_API_KEY                - Admin API key                               │
│  EMAIL_SERVICE_HOST_URL         - External email service URL                  │
│  EMAIL_X_API_KEY                - Email service API key                       │
│  EMAIL_X_API_KEY_FIELD          - Email service header field name            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### 1. **Database Optimization**
- Indexed primary keys and foreign keys
- Efficient query patterns
- Connection pooling with pg.Pool

### 2. **Stateless Design**
- No server-side session storage
- API key-based authentication
- Horizontal scaling ready

### 3. **Modular Architecture**
- Easy to extract services
- Microservice migration path
- Independent component testing

### 4. **Caching Opportunities**
- Vendor data caching
- GST rate caching
- Query result caching

This architecture provides a solid foundation for a GST filing service with clear separation of concerns, security, and scalability considerations.