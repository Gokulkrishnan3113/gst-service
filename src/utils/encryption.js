const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'your-32-character-secret-key-here!!'; // 32 bytes
const IV_LENGTH = 16; // For GCM, this is 12 or 16 bytes
const TAG_LENGTH = 16; // GCM tag length

// Ensure the key is exactly 32 bytes
function getKey() {
    if (SECRET_KEY.length === 32) {
        return SECRET_KEY;
    }
    // If not 32 bytes, hash it to get consistent 32 bytes
    return crypto.createHash('sha256').update(SECRET_KEY).digest();
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Base64 encoded encrypted data with IV and tag
 */
function encrypt(text) {
    try {
        const key = getKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipher(ALGORITHM, key);
        cipher.setAAD(Buffer.from('GST-SERVICE', 'utf8')); // Additional authenticated data
        
        let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        // Combine IV + tag + encrypted data
        const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
        return combined.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {any} - Decrypted and parsed data
 */
function decrypt(encryptedData) {
    try {
        const key = getKey();
        const combined = Buffer.from(encryptedData, 'base64');
        
        // Extract IV, tag, and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
        const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
        
        const decipher = crypto.createDecipher(ALGORITHM, key);
        decipher.setAuthTag(tag);
        decipher.setAAD(Buffer.from('GST-SERVICE', 'utf8'));
        
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed - invalid or corrupted data');
    }
}

/**
 * Middleware to decrypt incoming request body
 */
function decryptMiddleware(req, res, next) {
    if (req.body && req.body.encrypted_data) {
        try {
            const decryptedData = decrypt(req.body.encrypted_data);
            req.body = decryptedData;
            console.log('✅ Request payload decrypted successfully');
        } catch (error) {
            console.error('❌ Failed to decrypt request payload:', error.message);
            return res.status(400).json({
                success: false,
                error: 'Invalid encrypted payload',
                message: 'Failed to decrypt request data'
            });
        }
    }
    next();
}

/**
 * Middleware to encrypt outgoing response
 */
function encryptMiddleware(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
        try {
            const encryptedData = encrypt(data);
            const encryptedResponse = {
                encrypted_data: encryptedData,
                timestamp: new Date().toISOString(),
                encryption: 'AES-256-GCM'
            };
            console.log('✅ Response encrypted successfully');
            return originalJson.call(this, encryptedResponse);
        } catch (error) {
            console.error('❌ Failed to encrypt response:', error.message);
            return originalJson.call(this, {
                success: false,
                error: 'Encryption failed',
                message: 'Failed to encrypt response data'
            });
        }
    };
    
    next();
}

module.exports = {
    encrypt,
    decrypt,
    decryptMiddleware,
    encryptMiddleware
};