# GST Service - 5 Layer Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   HTTP Routes   │  │   Middleware    │  │  Request/Resp   │                │
│  │                 │  │                 │  │   Handling      │                │
│  │ • /vendors      │  │ • CORS          │  │                 │                │
│  │ • /gst          │  │ • Logging       │  │ • JSON Parsing  │                │
│  │ • /invoice      │  │ • Error Handler │  │ • Response      │                │
│  │ • /ledger       │  │ • API Key Auth  │  │   Formatting    │                │
│  │                 │  │ • GSTIN Auth    │  │ • Status Codes  │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  Express.js Server (Port: 3000)                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ Vendor Controller│  │Filing Controller│  │Invoice Controller│               │
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
│                                                                                 │
│  Request Orchestration & Response Coordination                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BUSINESS LOGIC LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        fileGstService                                   │   │
│  │  • Vendor validation & creation                                         │   │
│  │  • Timeframe validation & conflict detection                            │   │
│  │  • Invoice filtering & processing                                       │   │
│  │  • GST calculations & ITC processing                                    │   │
│  │  • Database transaction management                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
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
│                                                                                 │
│  Core Business Rules & Domain Logic                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
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
│                                                                                 │
│  Database Abstraction & Query Management                                       │
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
│                                                                                 │
│  Data Persistence & Storage Management                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Between Layers

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Client Request
      │
      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│PRESENTATION │ →  │APPLICATION │ →  │BUSINESS     │ →  │DATA ACCESS  │
│LAYER        │    │LAYER        │    │LOGIC LAYER  │    │LAYER        │
│             │    │             │    │             │    │             │
│• Routes     │    │• Controllers│    │• Services   │    │• Queries    │
│• Middleware │    │• Validation │    │• Utilities  │    │• Repository │
│• Auth       │    │• Orchestrate│    │• Algorithms │    │• Abstraction│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                    │                    │                    │
      │                    │                    │                    ▼
      │                    │                    │            ┌─────────────┐
      │                    │                    │            │DATABASE     │
      │                    │                    │            │LAYER        │
      │                    │                    │            │             │
      │                    │                    │            │• PostgreSQL │
      │                    │                    │            │• Tables     │
      │                    │                    │            │• Relations  │
      │                    │                    │            └─────────────┘
      │                    │                    │                    │
      │                    │                    │ ◄──────────────────┘
      │                    │ ◄──────────────────┘
      │ ◄──────────────────┘
      ▼
Client Response
```

## Layer Responsibilities

**🎯 PRESENTATION LAYER**
- HTTP request/response handling
- Route management
- Authentication & authorization
- Input validation & output formatting

**⚙️ APPLICATION LAYER**
- Request orchestration
- Controller logic
- Response coordination
- Error handling

**🧠 BUSINESS LOGIC LAYER**
- Core GST business rules
- Tax calculations
- ITC processing
- Domain-specific algorithms

**💾 DATA ACCESS LAYER**
- Database query abstraction
- Repository pattern implementation
- Data mapping & transformation

**🗄️ DATABASE LAYER**
- Data persistence
- Relational data storage
- Transaction management