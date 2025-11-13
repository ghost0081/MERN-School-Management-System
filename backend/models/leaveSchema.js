const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    reason: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, default: 1 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    deductionApplied: { type: Boolean, default: false },
    deductionAmount: { type: Number, default: 0 },
    deductionReason: { type: String },
    deductionMonth: { type: String },
    finalAmount: { type: Number },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    approvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('leave', leaveSchema);



