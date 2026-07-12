const PubNub = require('pubnub');

const credentials = {
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  secretKey: process.env.PUBNUB_SECRET_KEY,
  userId: 'blockchain-node'
};

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool; 
    
    if (!credentials.publishKey || !credentials.subscribeKey) {
        console.warn('⚠️ PubNub keys not found in .env. Peer synchronization is disabled.');
        this.isEnabled = false;
        return;
    }

    this.isEnabled = true;
    try {
        this.pubnub = new PubNub(credentials);
        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

        this.pubnub.addListener({
            message: messageObject => {
                const { channel, message } = messageObject;
                this.handleMessage(channel, message);
            },
            status: statusEvent => {
                if (statusEvent.error) {
                    console.error('PubNub status error:', statusEvent);
                }
            }
        });
    } catch (error) {
        console.error('PubNub initialization error:', error);
        this.isEnabled = false;
    }
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

    let parsedMessage;
    try {
        parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
    } catch(e) {
        parsedMessage = message; 
    }

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }

  publish({ channel, message }) {
    if (!this.isEnabled) return;
    
    try {
        this.pubnub.unsubscribe({ channels: [channel] });
        
        setTimeout(() => {
            this.pubnub.publish({ channel, message }).catch(err => {
                console.error('PubNub publish error:', err);
            });
            this.pubnub.subscribe({ channels: [channel] });
        }, 100);
    } catch (error) {
        console.error('PubNub publish error:', error);
    }
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;