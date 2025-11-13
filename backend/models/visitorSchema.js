const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    visitorCode: {
        type: String,
        required: true,
        unique: true,
        length: 5,
    },
    name: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
    },
    purpose: {
        type: String,
    },
    hostName: {
        type: String,
    },
    notes: {
        type: String,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    checkInTime: {
        type: Date,
        default: Date.now,
    },
    checkOutTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Checked In', 'Checked Out'],
        default: 'Checked In',
    },
}, { timestamps: true });

module.exports = mongoose.model('visitor', visitorSchema);

