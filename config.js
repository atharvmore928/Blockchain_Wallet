const MINE_RATE = 1000;

const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  lasthash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

const STARTING_BALANCE = 1000;

const FEE_PERCENTAGE = 0.001;

const ADMIN_WALLET_ADDRESS = '*admin-wallet*';

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, FEE_PERCENTAGE, ADMIN_WALLET_ADDRESS };