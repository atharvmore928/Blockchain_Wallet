const { v1: uuidV1 } = require('uuid');
const { verifySignature } = require('../util');
const { FEE_PERCENTAGE, ADMIN_WALLET_ADDRESS } = require('../config');

class Transaction {
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuidV1();
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    const fee = amount * FEE_PERCENTAGE;
    outputMap[recipient] = amount;
    outputMap[ADMIN_WALLET_ADDRESS] = fee;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount - fee;
    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  } 

  update({ senderWallet, recipient, amount }) {
    const fee = amount * FEE_PERCENTAGE;
    if (amount + fee > this.outputMap[senderWallet.publicKey]) {
      throw new Error('Amount exceeds balance');
    }


    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }


    if (!this.outputMap[ADMIN_WALLET_ADDRESS]) {
      this.outputMap[ADMIN_WALLET_ADDRESS] = fee;
    } else {
      this.outputMap[ADMIN_WALLET_ADDRESS] = this.outputMap[ADMIN_WALLET_ADDRESS] + fee;
    }


    this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount - fee;
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }
 
  static validTransaction(transaction) {
    const { input: { address, amount, signature }, outputMap } = transaction;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount, 0);

    if (Math.abs(amount - outputTotal) > 0.00001) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({
      publicKey: address,
      data: outputMap,
      signature
    })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }


    }
module.exports = Transaction;