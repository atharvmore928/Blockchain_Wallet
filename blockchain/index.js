const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require('../util');
const BlockRecord = require('../models/Block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    async addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastblock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);

        try {
            await BlockRecord.create(newBlock);
        } catch (error) {
            console.error('Error saving block to DB:', error);
        }
    }

    async replaceChain(chain, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        console.log('Replacing chain with', chain);
        this.chain = chain;
        if (onSuccess) {
            onSuccess();
        }

        try {
            await BlockRecord.deleteMany({});
            await BlockRecord.insertMany(chain);
        } catch (error) {
            console.error('Error replacing chain in DB:', error);
        }
    }

    validateTransactionData({ chain }) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();
            for (let transaction of block.data) {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: chain.slice(0, i),
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount');
                        return false;
                    }

                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once in the block');
                        return false;
                    }
                    transactionSet.add(transaction);
            }
        }
        return true;
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lasthash, nonce, hash, data, difficulty } = chain[i];
            const actualLastHash = chain[i - 1].hash;
            const lastDifficulty = chain[i - 1].difficulty;

            if (lasthash !== actualLastHash) {
                return false;
            }

            if (Math.abs(lastDifficulty - difficulty) > 1) {
                return false;
            }

            if (hash !== cryptoHash(timestamp, lasthash, data, nonce, difficulty)) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;