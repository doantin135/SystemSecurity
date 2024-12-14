const crypto = require('crypto');
const CryptoJS = require('crypto-js');

// AES Encryption
const aesKey = crypto.randomBytes(32);
const aesIv = crypto.randomBytes(16);

const encryptAES = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, aesIv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: aesIv.toString('hex'), encryptedData: encrypted };
};

const decryptAES = (encrypted) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, Buffer.from(encrypted.iv, 'hex'));
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// RSA Encryption
const { generateKeyPairSync, publicEncrypt, privateDecrypt } = crypto;

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const encryptRSA = (text) => {
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
};

const decryptRSA = (encrypted) => {
    const buffer = Buffer.from(encrypted, 'base64');
    const decrypted = privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
};

// DES Encryption
const desKey = CryptoJS.enc.Utf8.parse('12345678'); // 8-byte key

const encryptDES = (text) => {
    const encrypted = CryptoJS.DES.encrypt(text, desKey);
    return encrypted.toString();
};

const decryptDES = (encrypted) => {
    const decrypted = CryptoJS.DES.decrypt(encrypted, desKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
};

module.exports = {encryptAES, decryptAES, encryptRSA, decryptRSA, encryptDES, decryptDES,};
