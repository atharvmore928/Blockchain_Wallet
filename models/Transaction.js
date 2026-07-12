const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    outputMap: {
        type: Object,
        required: true
    },
    input: {
        type: Object,
        required: true
    }
}, { 
    timestamps: true,

    capped: { size: 1024 * 1024, max: 100 } 
});

module.exports = mongoose.model('TransactionRecord', TransactionSchema);
