const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    month: {
        type: String,
        required: true,
        // Format: "YYYY-MM" e.g., "2024-01" for January 2024
    },
    amount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid',
    },
    paidDate: {
        type: Date,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Cheque', 'Online', 'Bank Transfer', 'Other'],
    },
    remarks: {
        type: String,
    },
    duration: {
        type: String,
        enum: ['Monthly', '3 months', '6 months', 'Annual'],
        // Duration for which this payment was made
    },
}, { 
    timestamps: true,
    // Ensure one fee record per student per month
    indexes: [{ unique: true, fields: { student: 1, month: 1 } }]
});

module.exports = mongoose.model('fee', feeSchema);

