const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    employeeType: {
        type: String,
        enum: ['Staff', 'Teacher'],
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
        required: true,
        // Default to staff's salary if not specified
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
        enum: ['Cash', 'Cheque', 'Bank Transfer', 'Online', 'Other'],
    },
    deductions: {
        type: Number,
        default: 0,
    },
    bonus: {
        type: Number,
        default: 0,
    },
    remarks: {
        type: String,
    },
}, { timestamps: true });

// Ensure one payroll record per employee per month
// Compound index for staff
payrollSchema.index({ staff: 1, month: 1 }, { unique: true, sparse: true });
// Compound index for teacher
payrollSchema.index({ teacher: 1, month: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('payroll', payrollSchema);

