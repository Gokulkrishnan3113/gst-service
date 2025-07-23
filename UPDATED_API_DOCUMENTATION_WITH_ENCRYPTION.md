# GST Service API Documentation (With Encryption Support)

## Base URL
```
http://localhost:3000
```

## Authentication & Encryption

### API Key Authentication
All endpoints require API key authentication via the `Authorization` header:
- **Default API Key**: For admin operations (vendors, filings overview)
- **Vendor-specific API Key**: For vendor-specific operations (generated during vendor creation)

### Encryption (AES-256-GCM)
All API requests and responses are encrypted using AES-256-GCM algorithm.

#### Request Format
```json
{
  "encrypted_data": "base64-encoded-encrypted-payload"
}
```

#### Response Format
```json
{
  "encrypted_data": "base64-encoded-encrypted-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

#### Encryption Headers
```
Content-Type: application/json
Authorization: your-api-key-here
X-Encryption: AES-256-GCM
```

---

## Table of Contents
1. [Health Check](#health-check)
2. [Vendor Management](#vendor-management)
3. [GST Filing](#gst-filing)
4. [Invoice Management](#invoice-management)
5. [Ledger Management](#ledger-management)
6. [Encryption Examples](#encryption-examples)
7. [Error Codes](#error-codes)

---

## Health Check

### GET /
**Description:** Check if the GST Filing Service is running.

**cURL:**
```bash
curl -X GET http://localhost:3000/
```

**Parameters:** None

**Encrypted Response:**
```json
{
  "encrypted_data": "eyJzdGF0dXMiOiJHU1QgRmlsaW5nIFNlcnZpY2UgaXMgdXAgYW5kIHJ1bm5pbmcg8J+agCJ9",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Response:**
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
  -H "Authorization: your-default-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:** None

**Encrypted Response:**
```json
{
  "encrypted_data": "base64-encoded-vendor-list",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Response:**
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
**Description:** Create or update a vendor.

**cURL:**
```bash
curl -X POST http://localhost:3000/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: your-default-api-key" \
  -H "X-Encryption: AES-256-GCM" \
  -d '{
    "encrypted_data": "base64-encoded-vendor-payload"
  }'
```

**Encrypted Payload:**
```json
{
  "encrypted_data": "base64-encoded-payload"
}
```

**Decrypted Payload:**
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
- `email` (required): Vendor email for notifications

**Encrypted Success Response (201/200):**
```json
{
  "encrypted_data": "base64-encoded-success-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "gstin": "29ABCDE1234F2Z5",
    "name": "ABC Electronics",
    "merchant_type": "retailers",
    "state": "Karnataka",
    "turnover": 50000000,
    "is_itc_optedin": true,
    "email": "vendor@example.com",
    "api_key": "generated-64-character-api-key",
    "created_at": "2025-01-27T10:30:00.000Z"
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
  -H "X-Encryption: AES-256-GCM" \
  -d '{
    "encrypted_data": "base64-encoded-filing-payload"
  }'
```

**Encrypted Payload:**
```json
{
  "encrypted_data": "base64-encoded-payload"
}
```

**Decrypted Payload:**
```json
{
  "gstin": "29ABCDE1234F2Z5",
  "timeframe": "monthly",
  "merchant_type": "retailers",
  "name": "ABC Electronics",
  "state": "Karnataka",
  "turnover": 50000000,
  "is_itc_optedin": true
}
```

**Payload Field Definitions:**
- `gstin` (required): 15-character GST identification number
- `timeframe` (required): One of ["monthly", "quarterly", "annual"]
- `merchant_type` (required): One of ["manufacturers", "retailers", "wholesellers"]
- `name` (required): Vendor business name
- `state` (required): State name for filing jurisdiction
- `turnover` (required): Annual turnover amount (number)
- `is_itc_optedin` (required): Boolean for ITC opt-in status

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-filing-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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

**Encrypted Conflict Response (409):**
```json
{
  "encrypted_data": "base64-encoded-conflict-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Conflict Response:**
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
  -H "Authorization: your-default-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:** None

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-filings-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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
  -H "Authorization: your-default-api-key" \
  -H "X-Encryption: AES-256-GCM"
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
  -H "Authorization: vendor-specific-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-invoices-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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
  -H "X-Encryption: AES-256-GCM" \
  -d '{
    "encrypted_data": "base64-encoded-update-payload"
  }'
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number
- `invoice_id` (path parameter): Invoice identifier

**Encrypted Payload:**
```json
{
  "encrypted_data": "base64-encoded-payload"
}
```

**Decrypted Payload:**
```json
{
  "status": "REFUNDED",
  "payment_status": "REFUNDED"
}
```

**Allowed Values:**
- `status`: ["PAID", "NOTPAID", "PARTIALLY_PAID", "CANCELLED", "RETURNED", "REFUNDED"]
- `payment_status`: ["COMPLETED", "PARTIAL", "NOTPAID", "REFUNDED", "ON_HOLD"]

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-success-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
```json
{
  "success": true,
  "message": "Invoice updated successfully"
}
```

**Encrypted Error Response (400):**
```json
{
  "encrypted_data": "base64-encoded-error-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Error Response:**
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
  -H "Authorization: vendor-specific-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-pending-invoices",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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
  -H "Authorization: vendor-specific-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-ledger-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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
  -H "Authorization: vendor-specific-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-balance-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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
  -H "Authorization: vendor-specific-api-key" \
  -H "X-Encryption: AES-256-GCM"
```

**Parameters:**
- `gstin` (path parameter): 15-character GST identification number

**Encrypted Success Response (200):**
```json
{
  "encrypted_data": "base64-encoded-credit-notes-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

**Decrypted Success Response:**
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

## Encryption Examples

### Client-Side Encryption (Node.js)
```javascript
const crypto = require('crypto');

class GST_API_Client {
  constructor(apiKey, encryptionSecret) {
    this.apiKey = apiKey;
    this.encryptionSecret = encryptionSecret;
    this.baseURL = 'http://localhost:3000';
  }

  // Encrypt payload
  encrypt(data) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.encryptionSecret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const aad = Buffer.from('GST-API-v1', 'utf8');
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(aad);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted_data: Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'base64')
      ]).toString('base64')
    };
  }

  // Decrypt response
  decrypt(encryptedResponse) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.encryptionSecret, 'salt', 32);
    const aad = Buffer.from('GST-API-v1', 'utf8');
    
    const buffer = Buffer.from(encryptedResponse.encrypted_data, 'base64');
    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(16, 32);
    const encrypted = buffer.slice(32);
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);
    decipher.setAAD(aad);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // API call with encryption
  async makeRequest(endpoint, method = 'GET', payload = null) {
    const headers = {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
      'X-Encryption': 'AES-256-GCM'
    };

    let body = null;
    if (payload) {
      body = JSON.stringify(this.encrypt(payload));
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body
    });

    const encryptedResponse = await response.json();
    return this.decrypt(encryptedResponse);
  }
}

// Usage Examples
const client = new GST_API_Client('your-api-key', 'your-encryption-secret');

// Create vendor
const vendorData = {
  gstin: "29ABCDE1234F2Z5",
  name: "ABC Electronics",
  merchant_type: "retailers",
  state: "Karnataka",
  turnover: 50000000,
  is_itc_optedin: true,
  email: "vendor@example.com"
};

const result = await client.makeRequest('/vendors', 'POST', vendorData);
console.log(result);

// File GST
const filingData = {
  gstin: "29ABCDE1234F2Z5",
  timeframe: "monthly",
  merchant_type: "retailers",
  name: "ABC Electronics",
  state: "Karnataka",
  turnover: 50000000,
  is_itc_optedin: true
};

const filingResult = await client.makeRequest('/gst', 'POST', filingData);
console.log(filingResult);
```

### Python Client Example
```python
import requests
import json
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend
import os

class GSTAPIClient:
    def __init__(self, api_key, encryption_secret):
        self.api_key = api_key
        self.encryption_secret = encryption_secret.encode()
        self.base_url = 'http://localhost:3000'
        
    def _derive_key(self):
        kdf = Scrypt(
            algorithm=algorithms.SHA256(),
            length=32,
            salt=b'salt',
            iterations=100000,
            backend=default_backend()
        )
        return kdf.derive(self.encryption_secret)
    
    def encrypt(self, data):
        key = self._derive_key()
        iv = os.urandom(16)
        aad = b'GST-API-v1'
        
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        encryptor.authenticate_additional_data(aad)
        
        plaintext = json.dumps(data).encode()
        ciphertext = encryptor.update(plaintext) + encryptor.finalize()
        
        encrypted_data = base64.b64encode(iv + encryptor.tag + ciphertext).decode()
        return {"encrypted_data": encrypted_data}
    
    def decrypt(self, encrypted_response):
        key = self._derive_key()
        aad = b'GST-API-v1'
        
        buffer = base64.b64decode(encrypted_response['encrypted_data'])
        iv = buffer[:16]
        tag = buffer[16:32]
        ciphertext = buffer[32:]
        
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        decryptor.authenticate_additional_data(aad)
        
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        return json.loads(plaintext.decode())
    
    def make_request(self, endpoint, method='GET', payload=None):
        headers = {
            'Authorization': self.api_key,
            'Content-Type': 'application/json',
            'X-Encryption': 'AES-256-GCM'
        }
        
        data = None
        if payload:
            data = json.dumps(self.encrypt(payload))
        
        response = requests.request(
            method, 
            f"{self.base_url}{endpoint}", 
            headers=headers, 
            data=data
        )
        
        encrypted_response = response.json()
        return self.decrypt(encrypted_response)

# Usage
client = GSTAPIClient('your-api-key', 'your-encryption-secret')

# Get vendors
vendors = client.make_request('/vendors')
print(vendors)
```

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
- Encryption/decryption errors

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
- Encryption system errors

### Encrypted Error Response Format
```json
{
  "encrypted_data": "base64-encoded-error-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

### Decrypted Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Encryption-Specific Errors

**400 - Encryption Error**
```json
{
  "success": false,
  "error": "Encryption failed",
  "message": "Invalid encryption format or corrupted data"
}
```

**400 - Decryption Error**
```json
{
  "success": false,
  "error": "Decryption failed", 
  "message": "Unable to decrypt request payload"
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

### Encryption Security
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: Scrypt with salt
- **Authentication**: Additional Authenticated Data (AAD)
- **IV**: Random 16-byte initialization vector per request
- **Key Management**: Environment variable based

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/gst_service

# API Keys
DEFAULT_API_KEY=your-default-admin-api-key

# Encryption
ENCRYPTION_SECRET=your-32-character-secret-key-here!!

# Email Service (for reminders)
EMAIL_SERVICE_HOST_URL=https://your-email-service.com
EMAIL_X_API_KEY=your-email-service-api-key
EMAIL_X_API_KEY_FIELD=X-API-Key

# Server
PORT=3000
```

---

## Automated Processes

### Cron Jobs
- **Pending Invoice Reminders**: Runs monthly on 1st at 9 AM
- Sends encrypted email notifications for pending invoices to vendors

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

### Security Features
- **End-to-end encryption** for all API communications
- **API key authentication** with vendor-specific keys
- **Data integrity verification** with authentication tags
- **Secure key derivation** using Scrypt algorithm
- **Request/response validation** with encrypted payloads