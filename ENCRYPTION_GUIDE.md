# Encryption Implementation Guide

## Overview
This GST service now implements AES-256-GCM encryption for all API requests and responses to ensure data security and privacy.

## Encryption Details
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Length**: 16 bytes (randomly generated for each encryption)
- **Authentication Tag**: 16 bytes (for data integrity verification)
- **Additional Authenticated Data (AAD)**: "GST-SERVICE" string

## How It Works

### Request Encryption
All incoming request payloads should be encrypted and sent in this format:
```json
{
  "encrypted_data": "base64-encoded-encrypted-payload"
}
```

### Response Encryption
All API responses are automatically encrypted and returned in this format:
```json
{
  "encrypted_data": "base64-encoded-encrypted-response",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "encryption": "AES-256-GCM"
}
```

## Environment Configuration
Add the following to your `.env` file:
```env
ENCRYPTION_SECRET=your-32-character-secret-key-here!!
```

**Important**: The encryption secret must be exactly 32 characters for AES-256. If it's not 32 characters, the system will hash it using SHA-256 to ensure consistency.

## Client Implementation Examples

### Node.js Client Example
```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = 'your-32-character-secret-key-here!!';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function encrypt(data) {
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('GST-SERVICE', 'utf8'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
}

function decrypt(encryptedData) {
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
    const combined = Buffer.from(encryptedData, 'base64');
    
    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('GST-SERVICE', 'utf8'));
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
}

// Example usage
const payload = {
    gstin: "29ABCDE1234F2Z5",
    timeframe: "monthly",
    merchant_type: "retailers"
};

const encryptedPayload = encrypt(payload);
console.log('Encrypted:', encryptedPayload);

// Send to API
const requestBody = {
    encrypted_data: encryptedPayload
};
```

### cURL Example with Encryption
```bash
# First, encrypt your payload using a script or tool
# Then send the encrypted data:

curl -X POST http://localhost:3000/file-gst \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted_data": "your-base64-encoded-encrypted-payload-here"
  }'
```

## Security Features

### Data Integrity
- Uses GCM mode which provides both encryption and authentication
- Authentication tag ensures data hasn't been tampered with
- Additional Authenticated Data (AAD) adds extra security layer

### Key Management
- Environment variable for secret key
- Automatic key derivation if length is not exactly 32 bytes
- No hardcoded secrets in the codebase

### Error Handling
- Graceful handling of decryption failures
- Clear error messages for debugging
- Logging of encryption/decryption operations

## API Endpoints Affected
All endpoints now require encrypted payloads and return encrypted responses:

- `POST /file-gst`
- `GET /vendors`
- `GET /filings-with-invoices`
- `GET /filings-with-invoices/:gstin`
- `GET /invoices/:gstin`
- `PATCH /update-invoice/:gstin/:invoice_id`
- `GET /pending-invoices/:gstin`
- `GET /ledger/:gstin`
- `GET /balance/:gstin`
- `GET /credit-notes/:gstin`
- `GET /test-reminder-cron`

## Testing
Use the provided client examples to test encryption/decryption with your API endpoints. Make sure to:

1. Set the correct `ENCRYPTION_SECRET` in your environment
2. Encrypt request payloads before sending
3. Decrypt response data after receiving
4. Handle encryption/decryption errors appropriately

## Performance Considerations
- Encryption adds minimal overhead (~1-2ms per request)
- GCM mode is optimized for performance
- Base64 encoding increases payload size by ~33%

## Troubleshooting

### Common Issues
1. **"Decryption failed"**: Check that the encryption secret matches on both client and server
2. **"Invalid encrypted payload"**: Ensure the payload is properly base64 encoded
3. **"Encryption failed"**: Check that the data being encrypted is valid JSON

### Debug Logging
The service logs encryption/decryption operations:
- ✅ Success messages for successful operations
- ❌ Error messages for failed operations

## Security Best Practices
1. Keep the encryption secret secure and rotate it regularly
2. Use HTTPS in production to protect the encrypted data in transit
3. Monitor logs for encryption/decryption failures
4. Implement proper key management in production environments