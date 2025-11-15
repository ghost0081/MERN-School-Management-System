const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    inserted: {
        type: Number,
        default: 0,
    },
    updated: {
        type: Number,
        default: 0,
    },
    skipped: {
        type: Number,
        default: 0,
    },
    errors: [{
        row: {
            type: Number,
            required: true,
        },
        code: {
            type: String,
        },
        error: {
            type: String,
            required: true,
        },
    }],
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('ImportLog', importLogSchema);

