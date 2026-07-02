const Transaction = require('../wallet/transaction');

class TransactionMinor {
    constructor(transactionPool, blockchain, wallet, pubsub) {
        this.transactionPool = transactionPool;
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransaction() {
        const validTransactions = this.transactionPool.validTransactions();

        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        );

        this.blockchain.addBlock({ data: validTransactions });

        this.pubsub.broadcastChain();

        this.transactionPool.clear();
    }
}

module.exports = TransactionMinor;
