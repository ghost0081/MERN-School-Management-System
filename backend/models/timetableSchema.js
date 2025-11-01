const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    start: { type: String, required: true }, // e.g. 09:00
    end: { type: String, required: true },   // e.g. 09:45
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', required: true },
});

const timetableSchema = new mongoose.Schema({
    sclassName: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
    periods: [periodSchema]
}, { timestamps: true, indexes: [{ unique: true, fields: { sclassName: 1, day: 1 } }] });

module.exports = mongoose.model('timetable', timetableSchema);

 




