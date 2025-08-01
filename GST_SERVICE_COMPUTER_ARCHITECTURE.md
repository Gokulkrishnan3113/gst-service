# GST Service - Computer Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           GST SERVICE COMPUTER ARCHITECTURE                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              INPUT/OUTPUT LAYER                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                                               │
│  │   HTTP Clients  │    │  Third Party    │    │   Admin Panel   │                                               │
│  │                 │    │   Integrations  │    │                 │                                               │
│  │ • cURL/Postman  │    │ • ERP Systems   │    │ • API Testing   │                                               │
│  │ • REST APIs     │    │ • Accounting    │    │ • Vendor Mgmt   │                                               │
│  │ • JSON Payloads │    │ • Tax Software  │    │ • GST Filing    │                                               │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                                               │
│                                                                                                                     │
│                                    INPUT: JSON/HTTP Requests                                                        │
│                                   OUTPUT: JSON/HTTP Responses                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              PROTOCOL LAYER                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                                                                       │
│  │      HTTP       │    │      SMTP       │                                                                       │
│  │                 │    │                 │                                                                       │
│  │ • Express.js    │    │ • Email Service │                                                                       │
│  │ • Port 3000     │    │ • Axios Calls   │                                                                       │
│  │ • JSON/REST     │    │ • Reminders     │                                                                       │
│  └─────────────────┘    └─────────────────┘                                                                       │
│                                                                                                                     │
│                                    TCP/IP • IPv4 • DNS                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              SECURITY LAYER                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                    AUTHENTICATION & AUTHORIZATION                                              │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                                           │  │
│  │  │  Default API    │    │ Vendor-Specific │    │  GSTIN-based    │                                           │  │
│  │  │      Key        │    │    API Keys     │    │  Authorization  │                                           │  │
│  │  │                 │    │                 │    │                 │                                           │  │
│  │  │ • Admin Access  │    │ • 64-char Keys  │    │ • Resource      │                                           │  │
│  │  │ • Full Control  │    │ • Vendor Scope  │    │   Isolation     │                                           │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘                                           │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                         ENCRYPTION ALGORITHMS (NOT IMPLEMENTED)                               │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐                                                                                          │  │
│  │  │   Crypto.random │                                                                                          │  │
│  │  │                 │                                                                                          │  │
│  │  │ • API Key Gen   │                                                                                          │  │
│  │  │ • 64-char Keys  │                                                                                          │  │
│  │  │ • Secure Random │                                                                                          │  │
│  │  └─────────────────┘                                                                                          │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                           SECURITY POLICIES                                                    │  │
│  │                                                                                                                 │  │
│  │  • Input Validation & Sanitization    • SQL Injection Prevention (via pg library)                            │  │
│  │  • CORS Policy Configuration          • Authorization Header Check                                             │  │
│  │  • API Key Validation                 • GSTIN-based Access Control                                            │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            APPLICATION LAYER                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                         EXPRESS.JS SERVER                                                      │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │  │
│  │  │   Middleware    │    │     Routes      │    │   Controllers   │    │    Services     │                    │  │
│  │  │                 │    │                 │    │                 │    │                 │                    │  │
│  │  │ • CORS Handler  │    │ • /vendors      │    │ • Vendor CRUD   │    │ • GST Filing    │                    │  │
│  │  │ • Body Parser   │    │ • /gst          │    │ • Filing Logic  │    │ • Tax Calc      │                    │  │
│  │  │ • Request Log   │    │ • /invoice      │    │ • Invoice Mgmt  │    │ • ITC Processing│                    │  │
│  │  │ • API Key Auth  │    │ • /ledger       │    │ • Ledger Ops    │    │ • Email Service │                    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘                    │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                           BUFFER MANAGEMENT (BASIC)                                           │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                                                                   │  │
│  │  │  Request Buffer │    │ Response Buffer │                                                                   │  │
│  │  │                 │    │                 │                                                                   │  │
│  │  │ • JSON Parsing  │    │ • JSON Stringify│                                                                   │  │
│  │  │ • Express.json()│    │ • HTTP Response │                                                                   │  │
│  │  │ • Body Parsing  │    │ • Status Codes  │                                                                   │  │
│  │  └─────────────────┘    └─────────────────┘                                                                   │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              CACHE LAYER (NOT IMPLEMENTED)                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────┐                                                                                               │
│  │   No Caching    │                                                                                               │
│  │                 │                                                                                               │
│  │ • Direct DB     │                                                                                               │
│  │ • No Redis      │                                                                                               │
│  │ • No Memory     │                                                                                               │
│  │   Cache         │                                                                                               │
│  └─────────────────┘                                                                                               │
│                                                                                                                     │
│  Note: All data access goes directly to PostgreSQL database                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              LOGGING LAYER                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                         BASIC CONSOLE LOGGING                                                  │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                                           │  │
│  │  │  Request Logs   │    │   Error Logs    │    │  Business Logs  │                                           │  │
│  │  │                 │    │                 │    │                 │                                           │  │
│  │  │ • HTTP Method   │    │ • console.error │    │ • GST Filing    │                                           │  │
│  │  │ • URL Path      │    │ • Stack Traces  │    │ • Tax Calc      │                                           │  │
│  │  │ • Timestamp     │    │ • DB Errors     │    │ • Email Sent    │                                           │  │
│  │  │ • IST Timezone  │    │ • Validation    │    │ • Cron Jobs     │                                           │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘                                           │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  Note: Basic console.log() and console.error() - No advanced log management implemented                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             STORAGE LAYER                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                         PRIMARY STORAGE                                                        │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │  │
│  │  │   PostgreSQL    │    │  Connection     │    │   Transactions  │    │   Replication   │                    │  │
│  │  │    Database     │    │     Pool        │    │                 │    │                 │                    │  │
│  │  │                 │    │                 │    │ • ACID Props    │    │ • Master-Slave  │                    │  │
│  │  │ • ACID Compliant│    │ • pg.Pool       │    │ • Isolation     │    │ • No Replication│                    │  │
│  │  │ • Standard SQL  │    │ • Default Config│    │ • Rollback      │    │ • No Failover   │                    │  │
│  │  │ • Relational    │    │ • Connection    │    │ • Error Handle  │    │ • Basic Setup   │                    │  │
│  │  │ • 9 Tables      │    │   String        │    │                 │    │                 │                    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘                    │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                         DATABASE SCHEMA                                                        │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │  │
│  │  │     vendors     │    │   gst_filings   │    │    invoices     │    │    products     │                    │  │
│  │  │                 │    │                 │    │                 │    │                 │                    │  │
│  │  │ • gstin (PK)    │    │ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │                    │  │
│  │  │ • api_key       │    │ • gstin (FK)    │    │ • filing_id(FK) │    │ • invoice_id(FK)│                    │  │
│  │  │ • merchant_type │    │ • timeframe     │    │ • invoice_id    │    │ • sku           │                    │  │
│  │  │ • turnover      │    │ • tax_payable   │    │ • amount        │    │ • buying_price  │                    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘                    │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │  │
│  │  │  credit_ledger  │    │ credit_balances │    │  credit_notes   │    │invoice_tracker  │                    │  │
│  │  │                 │    │                 │    │                 │    │                 │                    │  │
│  │  │ • gstin         │    │ • gstin (PK)    │    │ • gstin         │    │ • gstin (PK)    │                    │  │
│  │  │ • txn_type      │    │ • igst_balance  │    │ • reason        │    │ • last_invoice  │                    │  │
│  │  │ • igst/cgst/sgst│    │ • cgst_balance  │    │ • amount        │    │   _id           │                    │  │
│  │  │ • txn_reason    │    │ • sgst_balance  │    │ • net_amount    │    │ • updated_at    │                    │  │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘                    │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  Note: Basic PostgreSQL setup - No advanced backup/recovery implemented                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         SYSTEM INTEGRATION                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                         EXTERNAL SERVICES                                                      │  │
│  │                                                                                                                 │  │
│  │  ┌─────────────────┐                                                                                           │  │
│  │  │  Email Service  │                                                                                           │  │
│  │  │                 │                                                                                           │  │
│  │  │ • Axios HTTP    │                                                                                           │  │
│  │  │ • External API  │                                                                                           │  │
│  │  │ • Reminder Cron │                                                                                           │  │
│  │  │ • Basic Template│                                                                                           │  │
│  │  └─────────────────┘                                                                                           │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                     │
│  ┌─────────────────┐                                                                                               │
│  │  Cron Jobs      │                                                                                               │
│  │                 │                                                                                               │
│  │ • node-cron     │                                                                                               │
│  │ • Monthly Run   │                                                                                               │
│  │ • Email Remind  │                                                                                               │
│  └─────────────────┘                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

## Architecture Components Summary

### 🔐 **SECURITY**
- **Authentication**: Dual API key system (admin + vendor-specific) - IMPLEMENTED
- **Encryption**: Only crypto.randomBytes for API key generation - NO ENCRYPTION IMPLEMENTED
- **Authorization**: GSTIN-based resource isolation
- **Protection**: Basic input validation, CORS enabled

### 📊 **LOGS**
- **Request Logs**: HTTP method, URL, timestamp (IST timezone)
- **Error Logs**: console.error with stack traces
- **Business Logs**: Basic console.log for operations
- **No Advanced Logging**: No log rotation, aggregation, or management

### 💾 **STORAGE**
- **Primary**: PostgreSQL with basic pg.Pool connection
- **Schema**: 9 tables (vendors, filings, invoices, products, ledger, etc.)
- **No Backup**: No automated backup or recovery implemented
- **No Replication**: Single database instance

### ⚡ **BUFFER**
- **Request Buffer**: Basic express.json() parsing
- **Response Buffer**: Standard HTTP response with JSON stringify
- **No Advanced Buffering**: No streaming, compression, or optimization

### 🚀 **CACHE**
- **No Caching Implemented**: All requests go directly to database
- **No Redis**: No distributed caching
- **No Memory Cache**: No in-memory optimization

### 🔒 **ENCRYPTION ALGORITHMS**
- **Only crypto.randomBytes**: For 64-character API key generation
- **No Data Encryption**: No AES, PBKDF2, or HMAC implemented
- **No Message Authentication**: No integrity checking

### 🌐 **PROTOCOLS**
- **HTTP**: Basic Express.js server on port 3000
- **SMTP**: External email service via Axios HTTP calls
- **No HTTPS**: No SSL/TLS implemented
- **No WebSockets**: No real-time features

### 📥📤 **INPUT/OUTPUT**
- **Input**: JSON/HTTP requests via cURL, Postman, third-party integrations
- **Output**: JSON/HTTP responses with standard status codes
- **Formats**: RESTful API with JSON payloads
- **Basic Validation**: Field presence and type checking

This architecture represents the ACTUAL implementation - a basic but functional GST service with essential features implemented and room for enhancement in caching, encryption, logging, and monitoring.