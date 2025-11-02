const mongoose = require('mongoose');

const stationerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    unit: {
        type: String,
        enum: ['Piece', 'Box', 'Pack', 'Set', 'Dozen', 'Ream', 'Other'],
        default: 'Piece',
    },
    pricePerUnit: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    category: {
        type: String,
        enum: ['Books', 'Writing Materials', 'Art Supplies', 'Office Supplies', 'Other'],
        default: 'Other',
    },
    supplier: {
        type: String,
    },
    reorderLevel: {
        type: Number,
        default: 0,
        min: 0,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
}, { 
    timestamps: true,
    // Ensure unique product name per school
    indexes: [{ unique: true, fields: { name: 1, school: 1 } }]
});

module.exports = mongoose.model('stationery', stationerySchema);

