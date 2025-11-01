const Timetable = require('../models/timetableSchema.js');

// Admin create or replace a day's timetable for a class
const upsertClassDay = async (req, res) => {
    try {
        const { sclassName, school, day, periods } = req.body;
        const result = await Timetable.findOneAndUpdate(
            { sclassName, day },
            { sclassName, school, day, periods },
            { new: true, upsert: true }
        );
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get timetable for a class (all days)
const getClassTimetable = async (req, res) => {
    try {
        const tts = await Timetable.find({ sclassName: req.params.id })
            .populate('sclassName', 'sclassName')
            .populate('periods.subject', 'subName')
            .populate('periods.teacher', 'name');
        if (!tts.length) return res.send({ message: 'No timetable found' });
        res.send(tts);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get timetable for a teacher (their assigned periods across classes)
const getTeacherTimetable = async (req, res) => {
    try {
        const tts = await Timetable.find({ 'periods.teacher': req.params.id })
            .populate('sclassName', 'sclassName')
            .populate('periods.subject', 'subName')
            .populate('periods.teacher', 'name');
        if (!tts.length) return res.send({ message: 'No timetable found' });
        res.send(tts);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { upsertClassDay, getClassTimetable, getTeacherTimetable };






