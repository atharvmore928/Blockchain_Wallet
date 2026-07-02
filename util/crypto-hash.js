const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');

    // Note: If you are following the Udemy course, 
    // it's highly recommended to use .join(' ') with a space 
    // so tests pass perfectly later on!
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

    // FIXED: Return a normal hex string. Do not convert to binary here!
    return hash.digest('hex');
};

module.exports = cryptoHash;