const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard

function encrypt(data, key) {
    const jsonData = JSON.stringify(data);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);

    const encrypted = Buffer.concat([
        cipher.update(jsonData, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

function decrypt(encryptedPayload, key) {
    const { iv, encryptedData, authTag } = encryptedPayload;

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
