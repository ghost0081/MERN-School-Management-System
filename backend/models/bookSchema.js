const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    rate: {
        type: Number,
        default: null,
    },
}, { timestamps: true });

// Compound index for case-insensitive search on name
bookSchema.index({ name: 'text' });

module.exports = mongoose.model('Book', bookSchema);

