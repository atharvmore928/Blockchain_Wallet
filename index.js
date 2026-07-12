require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const Transaction = require('./wallet/transaction');
const TransactionMinor = require('./app/transaction-minor');
const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const TransactionRecord = require('./models/Transaction');
const BlockRecord = require('./models/Block');

const app = express();

app.use(cors());

const startInMemoryServer = async () => {
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();
        console.log(`In-Memory MongoDB server started at: ${inMemoryUri}`);
        await mongoose.connect(inMemoryUri);
        console.log('Connected to In-Memory MongoDB');
    } catch (err) {
        console.error('Failed to start or connect to In-Memory MongoDB server:', err);
    }
};

const connectDatabase = async () => {
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
        try {
            console.log('Connecting to MongoDB Atlas...');
            await mongoose.connect(mongoUri);
            console.log('Connected to MongoDB Atlas');
        } catch (err) {
            console.error('MongoDB Atlas connection error:', err.message);
            console.log('Falling back to In-Memory MongoDB server...');
            await startInMemoryServer();
        }
    } else {
        console.log('No MONGO_URI provided.');
        await startInMemoryServer();
    }
};

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMinor = new TransactionMinor(transactionPool, blockchain, wallet, pubsub);

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.use('/api/auth', authRoutes);

app.get('/api/blocks', (req, res) => {
    console.log('GET /api/blocks ->', JSON.stringify(blockchain.chain, null, 2));
    res.json(blockchain.chain);
});

app.post('/api/mine', async (req, res) => {
    const { data } = req.body;
    await blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', authMiddleware, async (req, res) => {
    const { amount, recipient } = req.body;
    
    // Use the authenticated user's wallet
    const userWallet = new Wallet(req.user.privateKey);
    
    let transaction = transactionPool.existingTransaction({ inputAddress: userWallet.publicKey });

    try {
        if (transaction) {
            userWallet.balance = Wallet.calculateBalance({
                chain: blockchain.chain,
                address: userWallet.publicKey
            });
            transaction.update({ senderWallet: userWallet, recipient, amount });
        } else {
            transaction = userWallet.createTransaction({ 
                recipient, 
                amount, 
                chain: blockchain.chain 
            });
        }
        
        // Save to MongoDB Capped Collection
        // Note: we use updateOne with upsert to handle updates if the transaction already existed in the pool
        await TransactionRecord.updateOne(
            { id: transaction.id },
            { $set: { outputMap: transaction.outputMap, input: transaction.input } },
            { upsert: true }
        );
        
    } catch (error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', async (req, res) => {
    await transactionMinor.mineTransaction();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', authMiddleware, (req, res) => {
    const address = req.user.publicKey;
    res.json({
        address: address,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address: address
        })
    });
});

    
app.get('*' , (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    });
    
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (error) {
            console.error('sync blocks error:', error.message);
            return;
        }

        if (response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (error) {
            console.error('sync transaction pool error:', error.message);
            return;
        }

        if (response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });

  const walletFoo = new Wallet();
  const walletBar = new Wallet();
  const generateWalletTransaction = ({ recipient, amount }) => {
    const transaction = wallet.createTransaction({
      recipient,
      amount,
      chain: blockchain.chain
    });
    transactionPool.setTransaction(transaction);
  };

  const walletAction = () => generateWalletTransaction({
    wallet,
    recipient: walletFoo.publicKey,
    amount: 5
  });

  const walletFooAction = () => generateWalletTransaction({
    wallet: walletFoo,
    recipient: walletBar.publicKey,
    amount: 10
  });

  const walletBarAction = () => generateWalletTransaction({
    wallet: walletBar,
    recipient: wallet.publicKey,
    amount: 15
  });

  for (let i = 0; i < 10; i++) {
    if (i % 3 === 0) {
      walletAction();
      walletFooAction();
    } else if (i % 3 === 1) {
      walletAction();
      walletBarAction();
    } else {
      walletFooAction();
      walletBarAction();
    }

    transactionMinor.mineTransaction();
  }
};


let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

const init = async () => {
    await connectDatabase();

    try {
        const blocks = await BlockRecord.find().sort({ timestamp: 1 });
        if (blocks.length > 0) {
            console.log('Loaded blockchain from database');
            blockchain.chain = blocks;
        } else {
            console.log('No blocks found in database. Saving genesis block.');
            await BlockRecord.create(blockchain.chain[0]);
        }
    } catch (error) {
        console.error('Error loading blocks from database:', error);
    }

    const server = app.listen(PORT, () => {
        console.log(`listening at localhost:${PORT}`);

        if (PORT !== DEFAULT_PORT) {
            syncWithRootState();

            if (PEER_PORT) {
                setInterval(syncWithRootState, 5000);
            }
        }
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the other server first:`);
            console.error(`  netstat -ano | findstr :${PORT}`);
            console.error('  taskkill /PID <pid> /F');
            process.exit(1);
        }

        throw error;
    });
};

init(); 