const { encrypt, decrypt } = require('../middleware/encryption-helper');
const key = 'a2d8dbdf1d54922afa073dc3e0b8a52f436fea675d7196a06cc1602f8719d2fc';
console.log(key);

// const payload = { message: "Hello, World!" };


const payload = {
    "gstin": "33LMNOP9876W4X2",
    "timeframe": "annual",
    "merchant_type": "retailers",
    "state": "Tamil Nadu",
    "name": "VENDOR",
    "turnover": "30000000",
    "is_itc_optedin": true
};

// Encrypt
// const encrypted = encrypt(payload, key);
// console.log("Encrypted:", encrypted);

const encrypted = {
    "iv": "167ee918d40b2365e31808e1",
    "encryptedData": "3ac0791d404f3f9ffb13bf8062a0c87ae5d2e0b2ac1a91c7664aa5063e6ae86fe1ee21f5ccc50bcf07379345bc9774aff2c0b9d1f53c4774b513d2732c420ae0e68f5976babe252a2b87905ad0cddbae0fcb4665cb9cfa386b39c91b6a04d769aacdee7c6219d7547212857ef5a3770f71cd2daabe5c6efec6e5195ade9277df5ecf67682bd21e374d48d240369f3972642ef49fa48976a9a5e1ae6941c397fb25c00c9e379d8780056a28d3b5ce9f893d10a185419c2d73b05e8a655a491cf490353506a61c8c4ea1a0803111e7bc552c59d42bef6ca725e1024da7c9d15f545167f9c9a99675ece52ed78b5931a7cdd69cf28699bb3e61dd19f7531f915f79543f1b1014a1d87896d2229f98fc7a699ea5241bc9db8f4355e36157ef9f315ef21263f1d5baad1f20093ffed5519e6ba8ef43f0527288eb8f788fd480d297ff72d375db9c9cfb2049d0316e79fa15264e434cb74af68a8d2d83fbb54c6b46ab10ed8579ec0adf826a295df2aecc3a2dae2ad23f16365db3ab5f7f0bd7a8667103b220374895077af687bdd9a63e7e1f05bb48a573eb8d3231d36987eea4a1dd0a5d78a9d7f3159b70a0ec",
    "authTag": "5db26ca32aeb031118d730c28d9a23f4"
};


const decrypted = decrypt(encrypted, key);
console.log("Decrypted:", decrypted);
