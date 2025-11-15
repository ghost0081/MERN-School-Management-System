const mongoose = require('mongoose');

const libraryCopySchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    copyCode: {
        type: String,
        unique: true,
        index: true,
        required: true,
        trim: true,
    },
    shelf: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'issued', 'lost', 'damaged'],
        default: 'available',
    },
    acquiredOn: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('LibraryCopy', libraryCopySchema);

