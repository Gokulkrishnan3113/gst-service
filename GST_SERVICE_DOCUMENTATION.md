# GST Service Documentation

## AIM

To develop a comprehensive GST (Goods and Services Tax) filing service that automates tax calculations, manages vendor information, handles invoice processing, and provides secure API endpoints for GST compliance operations.

## Objective

The GST Service aims to:
- Streamline GST filing processes for businesses
- Automate tax calculations and Input Tax Credit (ITC) processing
- Provide secure vendor management with API key authentication
- Handle invoice lifecycle management and payment tracking
- Maintain ledger records for tax credit balances
- Send automated reminders for pending invoices
- Ensure data security through encryption and rate limiting

## Description

### Detailed Description

The GST Service is a Node.js-based web service built using Express.js framework that provides comprehensive GST management capabilities. The service follows a layered architecture pattern with clear separation of concerns across presentation, application, business logic, data access, and database layers.

The system manages the complete GST filing workflow from vendor registration to tax calculation and filing submission. It handles complex business rules including ITC eligibility, penalty calculations, and tax offsetting mechanisms. The service supports multiple filing timeframes (monthly, quarterly, annual) and accommodates different merchant types with varying compliance requirements.

### Services Provided

**Core Services:**
1. **Vendor Management**
   - Vendor registration with GSTIN validation
   - API key generation and management
   - MAC address-based device authorization
   - Email verification integration

2. **GST Filing Service**
   - Automated GST return filing for multiple timeframes
   - Tax calculation with ITC processing
   - Penalty calculation for late filings
   - Filing conflict detection and validation

3. **Invoice Management**
   - Invoice processing and validation
   - Status and payment tracking
   - Credit note generation for refunds/cancellations
   - Pending invoice identification

4. **Ledger Management**
   - ITC balance tracking and offsetting
   - Transaction logging for audit trails
   - Credit/debit entry management
   - Balance calculation and updates

5. **Notification Service**
   - Automated email reminders for pending invoices
   - Scheduled cron jobs for periodic notifications
   - Integration with external email service

### Services Used

**External Dependencies:**
- **PostgreSQL Database**: Primary data storage with ACID compliance
- **Email Service**: External API for sending notifications with encryption
- **Node.js Runtime**: Server-side JavaScript execution
- **Express.js Framework**: Web application framework
- **Axios**: HTTP client for external API calls

**Internal Utilities:**
- **LRU Cache**: In-memory caching for performance optimization
- **Crypto Module**: Encryption and API key generation
- **Node-cron**: Scheduled task execution
- **Joi Validator**: Request payload validation

**Detailed External Services:**

1. **PostgreSQL Database System**
   - **Version**: Compatible with pg@^8.16.0
   - **Connection**: Pool-based connection management with connection string
   - **Usage**: Primary data persistence for all business entities
   - **Tables**: 9 tables including vendors, gst_filings, invoices, products, credit_ledger, credit_balances, credit_notes, invoice_tracker, invoice_to_be_filed_again
   - **Features**: ACID transactions, foreign key constraints, JSON data types
   - **Connection Pool**: Automatic connection pooling for performance optimization

2. **External Email Service API**
   - **Protocol**: HTTPS REST API calls via Axios
   - **Authentication**: Custom header-based authentication with API keys
   - **Encryption**: AES-256-GCM with PBKDF2 key derivation for payload encryption
   - **Endpoint**: `/service/send_email` for email dispatch
   - **User Verification**: `/service/user_exists` endpoint for email validation
   - **Features**: Attachment support, HTML/text content, sender verification

3. **Node.js Core Modules**
   - **crypto**: Cryptographic operations, random key generation, AES encryption
   - **path**: File path utilities and route matching
   - **process**: Environment variable access and memory monitoring
   - **Buffer**: Binary data handling for encryption operations

**Internal Service Dependencies:**

1. **LRU Cache (lru-cache@^6.0.0)**
   - **Configuration**: 50MB max size, 5000 max items, 10-minute TTL
   - **Usage**: Caching vendor data, filing records, and API responses
   - **Features**: Size-based eviction, automatic cleanup, memory monitoring
   - **Cache Keys**: Prefixed by operation type (vendors_cache_page_, filings_with_invoices_)

2. **Express.js Middleware Stack**
   - **CORS**: Cross-origin resource sharing with cors@^2.8.5
   - **Body Parser**: JSON payload parsing with size limits
   - **Rate Limiter**: Custom token bucket implementation
   - **Authentication**: Multi-tier API key verification system
   - **Logging**: Request/response logging with IST timezone

3. **Validation Framework (Joi@^17.13.3)**
   - **Schema Validation**: Complex invoice and product validation
   - **Custom Validators**: GSTIN matching, status combinations, MAC address format
   - **Context-aware Validation**: Root GSTIN validation across nested objects
   - **Error Handling**: Detailed validation error reporting

4. **Scheduled Task Management (node-cron@^4.2.1)**
   - **Pending Invoice Reminders**: Monthly execution on 1st at 9 AM
   - **Health Checks**: Every 5 minutes for system monitoring
   - **Cron Expressions**: Standard cron syntax with timezone support
   - **Error Handling**: Comprehensive error logging and recovery

5. **HTTP Client (Axios@^1.10.0)**
   - **External API Calls**: Email service integration
   - **Request/Response Interceptors**: Automatic error handling
   - **Timeout Configuration**: Configurable request timeouts
   - **Header Management**: Custom authentication headers

6. **Path Matching (path-to-regexp@^8.2.0)**
   - **Route Matching**: Dynamic route parameter extraction
   - **Whitelist Validation**: Rate limiter bypass for specific routes
   - **Pattern Matching**: Express-style route patterns

**Environment Configuration:**
- **dotenv@^16.5.0**: Environment variable management with override support
- **Database Connection**: PostgreSQL connection string from environment
- **API Keys**: Multiple environment-based API key configurations
- **Email Service**: External service URLs and authentication tokens
- **Port Configuration**: Configurable server port (default: 3000)

### Architecture

The service implements a **5-Layer Architecture**:

1. **Presentation Layer**
   - Express.js routes and middleware
   - Request/response handling
   - CORS and authentication middleware
   - Rate limiting implementation

2. **Application Layer**
   - Controllers for business orchestration
   - Request validation and error handling
   - Response formatting and encryption

3. **Business Logic Layer**
   - GST calculation algorithms
   - ITC processing and offsetting
   - Tax compliance rules implementation
   - Filing conflict detection

4. **Data Access Layer**
   - Database query abstraction
   - Repository pattern implementation
   - Transaction management

5. **Database Layer**
   - PostgreSQL with 9 tables
   - Relational data modeling
   - ACID transaction support

**Key Architectural Components:**
- **Service-Oriented Architecture (SOA)**: Modular service design
- **Repository Pattern**: Data access abstraction
- **Middleware Pipeline**: Request processing chain
- **Caching Layer**: LRU cache for performance
- **Rate Limiting**: Token bucket algorithm implementation
     - External email service integration with encryption
     - Template-based email generation for reminders
     - Vendor email verification before registration
     - Encrypted payload transmission to email service
   
   - **Automated Reminders:**
     - Monthly cron job execution (1st day at 9 AM)
     - Pending invoice identification and aggregation
     - Personalized email content with invoice details
     - Failure handling and retry mechanisms
   
   - **Cron Job Management:**
     - Health check monitoring (every 5 minutes)
     - System status reporting with memory usage
     - Rate limiter metrics collection and reset
     - Error logging with IST timezone formatting
   
   - **Email Content:**
     - Invoice details (ID, date, amounts, days overdue)
     - Professional formatting with vendor-specific information
     - Clear call-to-action for payment processing
     - Service branding and contact information

### Encryption Algorithm

The service implements **AES-256-GCM** encryption for secure data transmission:

**Encryption Specifications:**
- **Algorithm**: AES-256-GCM (Advanced Encryption Standard with Galois/Counter Mode)
- **Key Length**: 256 bits (32 bytes)
- **IV Length**: 96 bits (12 bytes) - GCM standard
- **Authentication**: Built-in authentication tag for integrity verification

**Implementation Details:**
- **Request Encryption**: All sensitive request payloads are encrypted using vendor-specific secret keys
- **Response Encryption**: API responses are encrypted before transmission
- **Key Management**: 64-character hex-encoded secret keys generated using crypto.randomBytes()
- **Payload Structure**: 
  ```json
  {
    "iv": "<hex>",
    "encryptedData": "<hex>",
    "authTag": "<hex>"
  }
  ```

**Security Features:**
- **Authenticated Encryption**: Prevents tampering and ensures data integrity
- **Unique IV per Operation**: Prevents replay attacks
- **Vendor-Specific Keys**: Isolated encryption per vendor
- **Secure Random Generation**: Cryptographically secure key generation

**Email Service Encryption:**
- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Key Derivation**: PBKDF2 with 100,000 iterations and SHA-256
- **Salt**: 16-byte random salt per encryption
- **Base64 Encoding**: For safe transmission

**Detailed Encryption Implementation:**

**1. Primary Encryption System (AES-256-GCM)**
   ```javascript
   // Implementation in src/middleware/encryption-helper.js
   const ALGORITHM = 'aes-256-gcm';
   const IV_LENGTH = 12; // 96-bit nonce (GCM standard)
   ```
   
   **Encryption Process:**
   - **Step 1**: Generate 12-byte random IV using `crypto.randomBytes(IV_LENGTH)`
   - **Step 2**: Create cipher with `crypto.createCipheriv(ALGORITHM, key, iv)`
   - **Step 3**: Encrypt JSON stringified data in UTF-8 encoding
   - **Step 4**: Extract authentication tag using `cipher.getAuthTag()`
   - **Step 5**: Return hex-encoded IV, encrypted data, and auth tag
   
   **Decryption Process:**
   - **Step 1**: Parse hex-encoded IV, encrypted data, and auth tag
   - **Step 2**: Create decipher with `crypto.createDecipheriv(ALGORITHM, key, iv)`
   - **Step 3**: Set authentication tag using `decipher.setAuthTag(authTag)`
   - **Step 4**: Decrypt data and verify integrity
   - **Step 5**: Parse JSON and return original data

**2. Key Management System**
   ```javascript
   // 64-character hex key generation
   function generateRandomKey(length = 64) {
       return crypto.randomBytes(length).toString('hex').slice(0, length);
   }
   ```
   
   **Key Characteristics:**
   - **API Key**: 64-character hex string for authentication
   - **Secret Key**: 64-character hex string for encryption (256-bit when converted)
   - **Generation**: Cryptographically secure random bytes
   - **Storage**: Database storage with vendor association
   - **Usage**: Vendor-specific isolation for security

**3. Request/Response Encryption Flow**
   
   **Request Encryption (Client → Server):**
   ```javascript
   // Middleware: src/middleware/decrypt-body.js
   const decrypted = decrypt(req.body, vendor.secret_key);
   req.body = decrypted; // Replace encrypted payload with decrypted data
   ```
   
   **Response Encryption (Server → Client):**
   ```javascript
   // Middleware: src/middleware/encrypt-response.js
   const encrypted = encrypt(result, secretKey);
   return res.status(200).json(encrypted);
   ```
   
   **Security Measures:**
   - Vendor authentication before decryption
   - Automatic error handling for invalid payloads
   - Secret key validation and existence checks
   - Proper error responses for encryption failures

**4. Email Service Encryption (Advanced)**
   ```javascript
   // Implementation in src/utils/mailservice-encryption-helper.js
   const ALGORITHM = 'aes-256-gcm';
   const ITERATIONS = 100000; // PBKDF2 iterations
   const KEY_LENGTH = 32; // 256-bit key
   const SALT_LENGTH = 16; // 128-bit salt
   ```
   
   **Enhanced Security Features:**
   - **PBKDF2 Key Derivation**: Password-based key derivation with 100,000 iterations
   - **Random Salt**: 16-byte salt per encryption operation
   - **SHA-256 Digest**: Secure hash function for key derivation
   - **Base64 Encoding**: Safe transmission format for binary data
   
   **Email Encryption Process:**
   - **Step 1**: Generate random salt and IV
   - **Step 2**: Derive encryption key using PBKDF2
   - **Step 3**: Encrypt email payload with AES-256-GCM
   - **Step 4**: Package with metadata (algorithm, iterations, salt)
   - **Step 5**: Base64 encode entire payload for transmission

**5. Security Considerations**
   
   **Cryptographic Strengths:**
   - **AES-256**: Industry-standard symmetric encryption
   - **GCM Mode**: Authenticated encryption with built-in integrity
   - **Random IV**: Unique initialization vector per operation
   - **Secure Random**: Cryptographically secure random number generation
   
   **Implementation Security:**
   - **Key Isolation**: Vendor-specific encryption keys
   - **Error Handling**: Secure error messages without key exposure
   - **Memory Management**: Proper buffer handling for sensitive data
   - **Timing Attack Prevention**: Consistent processing times
   
   **Compliance Features:**
   - **Data Integrity**: Authentication tags prevent tampering
   - **Confidentiality**: Strong encryption protects data in transit
   - **Non-repudiation**: Vendor-specific keys ensure accountability
   - **Forward Secrecy**: Unique IVs prevent pattern analysis

**Detailed Encryption Implementation:**

1. **Primary Encryption System (AES-256-GCM)**
   ```javascript
   // Implementation in src/middleware/encryption-helper.js
   const ALGORITHM = 'aes-256-gcm';
   const IV_LENGTH = 12; // 96-bit nonce (GCM standard)
   ```
   
   **Encryption Process:**
   - **Step 1**: Generate 12-byte random IV using crypto.randomBytes()

## Conclusion

The GST Service successfully provides a comprehensive solution for GST compliance management with robust security, scalable architecture, and automated processing capabilities. The service handles complex tax calculations, maintains accurate records, and ensures secure data transmission through modern encryption standards.

Key achievements include:
- **Automated GST Processing**: Streamlined filing workflow with validation
- **Secure Architecture**: Multi-layer security with encryption and authentication
- **Scalable Design**: Modular architecture supporting future enhancements
- **Compliance Management**: Accurate tax calculations and penalty handling
- **Audit Trail**: Complete transaction logging and balance tracking

The service demonstrates enterprise-grade capabilities with proper error handling, logging, and monitoring features while maintaining high security standards through encryption and access controls.

## Further Enhancements

### 1. Advanced Caching Strategy
- **Redis Integration**: Implement distributed caching with Redis for better scalability
- **Cache Invalidation**: Smart cache invalidation strategies for data consistency
- **Multi-level Caching**: Implement L1 (in-memory) and L2 (Redis) cache layers
- **Cache Warming**: Pre-populate frequently accessed data

### 2. Enhanced Rate Limiting
- **Distributed Rate Limiting**: Redis-based rate limiting for multi-instance deployments
- **Adaptive Rate Limiting**: Dynamic rate adjustment based on system load
- **User-based Quotas**: Different rate limits for different user tiers
- **Rate Limit Analytics**: Detailed metrics and monitoring for rate limit violations

### 3. Database Indexing and Optimization
- **B-Tree Indexes**: Implement B-tree indexes on frequently queried columns
  - `vendors.gstin` (primary lookups)
  - `gst_filings.gstin` (filing queries)
  - `invoices.gst_filing_id` (invoice lookups)
  - `credit_ledger.gstin` (ledger queries)
- **Composite Indexes**: Multi-column indexes for complex queries
- **Partial Indexes**: Conditional indexes for specific query patterns
- **Query Optimization**: Analyze and optimize slow queries using EXPLAIN plans

### 4. Additional Enhancements
- **Database Connection Pooling**: Optimize connection management
- **Monitoring and Alerting**: Comprehensive system monitoring
- **API Documentation**: Interactive API documentation with Swagger
- **Backup and Recovery**: Automated database backup strategies
- **Load Balancing**: Horizontal scaling with load balancers
- **Container Orchestration**: Docker and Kubernetes deployment