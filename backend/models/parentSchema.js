const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true }, // full mobile; password = last 5 digits
    email: { type: String },
    role: { type: String, default: 'Parent' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'student', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
}, { timestamps: true });

module.exports = mongoose.model('parent', parentSchema);



