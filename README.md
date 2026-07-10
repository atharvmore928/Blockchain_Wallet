# Blockchain Wallet & Cryptochain

A full-stack, decentralized blockchain and cryptocurrency application built from scratch using Node.js, Express, and React. 

This project implements the core concepts of a blockchain system, including a distributed ledger, proof-of-work algorithm, digital wallets with cryptographic signatures, and a peer-to-peer network for synchronization.

## 🌟 Features

- **Custom Blockchain:** Implementations of Blocks, Chain validation, and a Proof-of-Work (PoW) consensus mechanism with dynamic difficulty.
- **Cryptocurrency Wallets:** Keypair generation (using elliptic curve cryptography `secp256k1`), digital signatures, and balance calculation.
- **Transactions:** Ability to create transactions, calculate inputs/outputs, and validate signatures.
- **Transaction Pool:** A mempool to store unconfirmed transactions before they are mined.
- **Transaction Miner:** Gathers valid transactions from the pool, mines a new block, and adds it to the blockchain while rewarding the miner.
- **Peer-to-Peer (P2P) Network:** Real-time synchronization of the blockchain and transaction pool across multiple nodes using **PubNub** and **Redis**.
- **Interactive Frontend:** A React web application to view the blockchain, explore the transaction pool, and conduct transactions.

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- Cryptography: `elliptic` (secp256k1), `hex-to-binary`
- Networking: PubNub, Redis, `request`
- Testing: Jest

**Frontend:**
- React.js
- React-Router-DOM for navigation
- React-Bootstrap for styling
- Parcel for bundling

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) installed on your machine.
- [Redis](https://redis.io/download) installed and running (optional, depending on your PubNub/Redis configuration).

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd Blockchain_Wallet
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

**1. Start the main node & React frontend:**
This will build the frontend, start the backend server on `localhost:3000`, and serve the React app.
```bash
npm run dev
```

**2. Start a peer node:**
To test the P2P network, you can spin up additional peer nodes. They will automatically generate a random port and sync with the root node on port 3000.
```bash
npm run dev-peer
```

### Running Tests

To run the comprehensive Jest test suite for the blockchain logic:
```bash
npm run test
```

## 📡 API Endpoints

The backend exposes several REST API endpoints to interact with the blockchain:

- `GET /api/blocks` - Retrieve the entire blockchain array.
- `POST /api/mine` - Mine a new block with provided data.
- `POST /api/transact` - Create a new transaction (requires `amount` and `recipient`).
- `GET /api/transaction-pool-map` - View the current unconfirmed transactions in the pool.
- `GET /api/mine-transactions` - Mine the current transaction pool into a new block.
- `GET /api/wallet-info` - Get the current wallet's public address and balance.

## 📁 Project Structure

- `blockchain/` - Core blockchain logic (Blocks, Chain validation).
- `wallet/` - Digital wallet, transaction generation, and transaction pool.
- `app/` - Express server setup, P2P networking (PubSub), and transaction mining logic.
- `client/` - React frontend application source code.
- `util/` - Cryptographic utilities and hashing functions.
- `index.js` - Main entry point for the Express backend.

## 📜 License

This project is licensed under the ISC License.
