const crypto = require('crypto');

// Encryption key và iv cố định
const ENCRYPTION_KEY = "YourSecretKey123YourSecretKey123"; // 32 bytes
const IV = "1234567890123456"; // 16 bytes

const encryptionUtils = {
  encrypt(text) {
    if (!text) return text;
    try {
      const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  },

  decrypt(text) {
    if (!text) return text;
    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
      let decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return text;
    }
  },

  encryptObject(obj) {
    if (!obj) return obj;
    const encryptedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.shouldEncryptField(key)) {
        encryptedObj[key] = this.encrypt(value);
      } else {
        encryptedObj[key] = value;
      }
    }
    return encryptedObj;
  },

  decryptObject(obj) {
    if (!obj) return obj;
    const decryptedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.shouldEncryptField(key)) {
        decryptedObj[key] = this.decrypt(value);
      } else {
        decryptedObj[key] = value;
      }
    }
    return decryptedObj;
  },

  shouldEncryptField(fieldName) {
    const sensitiveFields = [
      'studentName',
      'className',
      'lecturerName'
    ];
    return sensitiveFields.includes(fieldName);
  }
};

module.exports = encryptionUtils;