const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
    let transactionpool, transaction, senderWallet;

    beforeEach(() => {
        transactionpool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        });
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionpool.setTransaction(transaction);
            expect(transactionpool.transactionMap[transaction.id])
                .toEqual(transaction);
        });
    });

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            transactionpool.setTransaction(transaction);
            expect(transactionpool.existingTransaction({ inputAddress: senderWallet.publicKey }))
                .toEqual(transaction);
        });
    });

    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();
            
            // Cleanly spy on console.error and suppress standard error output during tests
            jest.spyOn(console, 'error').mockImplementation(errorMock);

            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                });

                if (i % 3 === 0) {
                    transaction.input.amount = 99999;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign('foo');
                } else {
                    validTransactions.push(transaction);
                }

                // FIX: Add ALL transactions (both valid and invalid) to the pool
                transactionpool.setTransaction(transaction);
            }
        });

        afterEach(() => {
            // Restore console.error to its original state after these tests run
            jest.restoreAllMocks();
        });

        it('returns valid transactions', () => {
            expect(transactionpool.validTransactions()).toEqual(validTransactions);
        });

        it('logs errors for invalid transactions', () => {
            transactionpool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clear()', () => {
        it('clears the transaction pool', () => {
            transactionpool.setTransaction(transaction);
            transactionpool.clear();
            expect(transactionpool.transactionMap).toEqual({});
        });
    });

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain transactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: 'foo-recipient',
                    amount: 20
                });
                transactionpool.setTransaction(transaction);

                if (i % 2 === 0) {
                    blockchain.addBlock({ data: [transaction] });
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            } // FIX 1: The extra '}' that was here has been removed.

            transactionpool.clearBlockchainTransactions({ chain: blockchain.chain });
            expect(transactionpool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
}); 