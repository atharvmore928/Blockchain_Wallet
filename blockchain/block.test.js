const hextoBinary = require('hex-to-binary');
const Block = require('./block');
const { cryptoHash } = require('../util'); 
const { GENESIS_DATA, MINE_RATE } = require('../config');

describe('Block', () => {
    const timestamp = 2000;
    const lasthash = 'foo-lasthash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({ timestamp, lasthash, hash, data });

    it('has a timestamp, lasthash, hash and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lasthash).toEqual(lasthash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

    it('has a nonce and difficulty property', () => {
        const nonceVal = 1;
        const difficultyVal = 1;
        const blockWithExtras = new Block({ timestamp, lasthash, hash, data, nonce: nonceVal, difficulty: difficultyVal });

        expect(blockWithExtras.nonce).toEqual(nonceVal);
        expect(blockWithExtras.difficulty).toEqual(difficultyVal);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        console.log(genesisBlock);

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });
        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });
});

describe('mineBlock()', () => {
    const lastblock = Block.genesis();
    const data = 'mined data'; 
    const minedBlock = Block.mineBlock({ lastblock, data });

    it('returns a block instance', () => {
        expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the \'lasthash\' to be the \'hash\' of the lastblock', () => {
        expect(minedBlock.lasthash).toEqual(lastblock.hash);
    });

    it('sets the \'data\' to the mined data', () => {
        expect(minedBlock.data).toEqual(data);
    });

    it('sets a \'timestamp\'', () => {
        expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('creates a SHA-256 \'hash\' based on the proper inputs', () => {
        expect(minedBlock.hash).toEqual(
            cryptoHash(
                 minedBlock.timestamp,
                 minedBlock.nonce,
                 minedBlock.difficulty,
                 lastblock.hash,
                 data)
        );
    });

    it('sets a hash that matches the difficulty criteria', () => {
        expect(hextoBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('adjusts the difficulty', () => {
        const possibleResults = [lastblock.difficulty + 1, lastblock.difficulty - 1];

        expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
    });
}); // <-- FIXED: Added this missing closing syntax for 'mineBlock()'

describe('adjustDifficulty()', () => {
    const block = Block.genesis();

    it('raises the difficulty for a quickly mined block', () => {
        expect(Block.adjustDifficulty({ originalBlock: block, timestamp: block.timestamp - 100
            })).toEqual(block.difficulty + 1);
    });

    it('lowers the difficulty for a slowly mined block', () => {
        expect(Block.adjustDifficulty({ originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
        })).toEqual(block.difficulty - 1);
    });

    it('has a lower limit of 1', () => {
        block.difficulty = -1;
        expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
    });
});


