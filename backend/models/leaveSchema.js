const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    reason: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('leave', leaveSchema);



