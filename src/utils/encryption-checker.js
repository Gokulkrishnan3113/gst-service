const { encrypt, decrypt } = require('../middleware/encryption-helper');
const key = 'f9775c93d12b613bb17fb3fff1780ed5de4a2f72ab0b52c68e765eb9796b9515';
console.log(key);

// const payload = { message: "Hello, World!" };


const payload = {
    gstin: '29ABCDE1234F2Z5',
    mac_address: [
        '1f:fa:c7:42:1d:22',
        '1f:fa:c8:39:1d:58'
    ]
}

const encrypted = encrypt(payload, key);
console.log("Encrypted:", encrypted);

// const encrypted = {
//     "iv": "18b285a42860ed9fa3e2b326",
//     "encryptedData": "01742ff7942ca379de1b3cc4bb561fbb67881af16a3aa7333d53d76b7593e45bee8b3672a419639f46596a1f7b3601c296d2de6a7b8ddafbf61c024474fbd9829abd4b6a09c590ac343819387ef66bd4a96ea8",
//     "authTag": "14def51a7ab4a0771530ea15bd306bdc"
// }


const decrypted = decrypt(encrypted, key);
console.log("Decrypted:", decrypted);
