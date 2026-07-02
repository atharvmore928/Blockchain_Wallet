const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION' // FIX 1: Added the transaction channel
};

class PubSub {
  // FIX 2: Added transactionPool to the constructor arguments
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool; 
    this.isEnabled = true;

    try {
      this.publisher = redis.createClient();
      this.subscriber = redis.createClient();

      this.publisher.on('error', () => {
        this.isEnabled = false;
      });

      this.subscriber.on('error', () => {
        this.isEnabled = false;
      });

      this.subscriber.on(
        'message',
        (channel, message) => this.handleMessage(channel, message)
      );

      this.subscribeToChannels();
    } catch (error) {
      this.isEnabled = false;
    }
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

    const parsedMessage = JSON.parse(message);

    // FIX 3: Turned into a switch statement to elegantly handle both chains and transactions
    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage);
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          });
        });
        break;
      default:
        return;
    }
  }

  subscribeToChannels() {
    if (!this.isEnabled) {
      return;
    }

    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    if (!this.isEnabled) {
      return;
    }
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  // FIX 4: Added the missing broadcastTransaction method for Postman to use
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;