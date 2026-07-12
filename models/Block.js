const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    timestamp: {
        type: Number,
        required: true
    },
    lasthash: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    data: {
        type: Array,
        required: true
    },
    nonce: {
        type: Number,
        required: true
    },
    difficulty: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('BlockRecord', BlockSchema);
