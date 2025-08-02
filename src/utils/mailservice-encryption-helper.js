const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
const DIGEST = 'sha256';

function mailencrypt(data, password) {
    console.log("encrypt : ", data, password);

    const plaintext = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const encryptedPayload = {
        ciphertext: Buffer.from(ciphertext).toString('base64'),
        nonce: iv.toString('base64'),
        tag: tag.toString('base64'),
        salt: salt.toString('base64'),
        algorithm: ALGORITHM,
        iterations: ITERATIONS
    };

    return Buffer.from(JSON.stringify(encryptedPayload)).toString('base64');
}

function maildecrypt(encryptedPayload, password) {
    console.log("decrypt : ", data, password);

    try {
        const decryptedJson = JSON.parse(Buffer.from(encryptedPayload, 'base64').toString('utf8'));

        const ciphertext = Buffer.from(decryptedJson.ciphertext, 'base64');
        const iv = Buffer.from(decryptedJson.nonce, 'base64');
        const tag = Buffer.from(decryptedJson.tag, 'base64');
        const salt = Buffer.from(decryptedJson.salt, 'base64');

        const key = crypto.pbkdf2Sync(password, salt, decryptedJson.iterations || ITERATIONS, KEY_LENGTH, DIGEST);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        const plaintext = decrypted.toString('utf8');

        try {
            return JSON.parse(plaintext);
        } catch {
            return plaintext;
        }
    } catch (err) {
        return `Decryption failed: ${err.message}`;
    }
}

module.exports = { mailencrypt, maildecrypt };
