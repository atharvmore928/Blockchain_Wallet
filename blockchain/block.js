const hextoBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const { cryptoHash } = require('../util');

class Block {
    constructor ({ timestamp, lasthash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lasthash = lasthash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new Block(GENESIS_DATA);
    }

    static mineBlock({ lastblock, data }) {
        let hash, timestamp;
        let { difficulty } = lastblock;
        const lasthash = lastblock.hash;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastblock, timestamp });
            hash = cryptoHash(timestamp, nonce, difficulty, lasthash, data);
            
            // CORRECT: We only convert to binary temporarily for the difficulty check.
            // The actual 'hash' saved to the block remains a proper Hex string.
        } while (hextoBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({ timestamp, lasthash, data, nonce, difficulty, hash });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;
        const difference = timestamp - originalBlock.timestamp;

        if (difficulty < 1) return 1;

        if (difference > MINE_RATE) {
            // FIXED: Using Math.max guarantees the difficulty never drops below 1
            return Math.max(difficulty - 1, 1);
        }

        return difficulty + 1;
    }
}

module.exports = Block;