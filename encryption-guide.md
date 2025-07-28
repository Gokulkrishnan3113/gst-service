# 🔐 GST Service Integration Guide

Welcome! This guide will help you integrate securely with the GST Service using **AES-256-GCM** encryption. Every registered vendor is issued:

- `api_key`: Used in headers to authorize requests.
- `secret_key`: Used to encrypt request data and decrypt response data.

> 🚨 **Never expose your `secret_key` publicly.** Keep it securely on your server.

---

## 📦 What You’ll Get Upon Registration

```json
{
  "api_key": "your-api-key-here",
  "secret_key": "32-byte-hex-string"
}
```

---

## ⚙️ How Encryption & Decryption Works

We use AES-256-GCM — a secure, authenticated encryption algorithm — to protect sensitive information in transit.

### 🔐 You must:
- **Encrypt request bodies** using your `secret_key` before sending to the API.
- **Decrypt response payloads** received from the API using the same `secret_key`.

---

## 🧩 Request & Response Format

### ✅ Request Payload (Encrypted)

```json
{
  "iv": "<hex>",
  "encryptedData": "<hex>",
  "authTag": "<hex>"
}
```

### ✅ Response Payload (Encrypted)

```json
{
  "iv": "<hex>",
  "encryptedData": "<hex>",
  "authTag": "<hex>"
}
```

---

## 🧠 Integration Steps

### 1. 📁 Create `encryption-helper.js` (or `.ts`)

```js
// encryption-helper.js

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce as recommended

function encrypt(data, key) {
  const jsonData = JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);

  const encrypted = Buffer.concat([cipher.update(jsonData, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(payload, key) {
  const { iv, encryptedData, authTag } = payload;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = { encrypt, decrypt };
```

---

### 2. 📤 Sending Encrypted Requests

```js
const axios = require('axios');
const { encrypt } = require('./encryption-helper');

const API_URL = 'https://your-gst-service/api/endpoint';
const API_KEY = 'your-api-key-here';
const SECRET_KEY = 'your-secret-key-here';

const payload = {
  gstin: '27AAAPL1234C1ZV',
  name: 'ABC Traders',
  turnover: 1200000
};

const encrypted = encrypt(payload, SECRET_KEY);

axios.post(API_URL, encrypted, {
  headers: {
    'Authorization': API_KEY,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  // We'll decrypt this below
  const encryptedResponse = response.data;
  const { decrypt } = require('./encryption-helper');
  const decrypted = decrypt(encryptedResponse, SECRET_KEY);

  console.log('✅ Decrypted Response:', decrypted);
})
.catch(err => {
  console.error('❌ Request failed:', err.message);
});
```

---

### 3. 📥 Decrypting Responses

> Already shown above in the `.then()` of the request.

Just call:

```js
const decrypted = decrypt(response.data, SECRET_KEY);
```

---

## 🧪 Example

### 📨 Request (before encryption)
```json
{
  "gstin": "27AAAPL1234C1ZV",
  "name": "ABC Traders",
  "turnover": 1200000
}
```

### 📤 Encrypted Request (sent to API)
```json
{
  "iv": "d4f96b1e5b78e8c12a93fc98",
  "encryptedData": "2fcba223d1095cc86cb9...",
  "authTag": "e42ae981d6677c9d8653c..."
}
```

### 📥 Encrypted Response (received)
```json
{
  "iv": "a1b2c3...",
  "encryptedData": "ee12a8f9c1...",
  "authTag": "d2fe93a1..."
}
```

### 🔓 Decrypted Response
```json
{
  "success": true,
  "message": "Vendor registered successfully"
}
```

---

## 🧷 Security Best Practices

- Use HTTPS for all requests.
- Store `secret_key` securely (e.g. in environment variables).
- Do not share or hardcode your secret key in frontend/mobile apps.
- Always validate decrypted data before usage.

---

## ❓ Troubleshooting

| Issue                            | Solution                                                                 |
|----------------------------------|--------------------------------------------------------------------------|
| `Invalid API Key`                | Check if you're using the correct `api_key` in the `Authorization` header |
| `Invalid encrypted payload`      | Ensure you encrypted with the correct `secret_key` and formatted the payload properly |
| `Decryption failed`              | Check if `iv`, `authTag`, and `encryptedData` are all included and valid |

---
