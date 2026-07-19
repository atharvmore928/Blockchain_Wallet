const Transaction = require('../wallet/transaction');

class TransactionMinor {
    constructor(transactionPool, blockchain, wallet, pubsub) {
        this.transactionPool = transactionPool;
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    async mineTransaction() {
        const validTransactions = this.transactionPool.validTransactions();

        if (validTransactions.length === 0) {
            return false;
        }

        await this.blockchain.addBlock({ data: validTransactions });

        this.pubsub.broadcastChain();

        this.transactionPool.clear();
        return true;
    }
}

module.exports = TransactionMinor;
