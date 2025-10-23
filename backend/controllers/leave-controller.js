const Leave = require('../models/leaveSchema.js');

const createLeave = async (req, res) => {
    try {
        const leave = new Leave({ ...req.body, status: 'Pending' });
        const result = await leave.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// list teacher leaves by teacher
const listTeacherLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ teacher: req.params.id }).sort({ createdAt: -1 });
        if (leaves.length === 0) return res.send({ message: 'No leaves found' });
        res.send(leaves);
    } catch (error) {
        res.status(500).json(error);
    }
};

// list all leaves for a school (admin)
const listSchoolLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ school: req.params.id }).populate('teacher', 'name email').sort({ createdAt: -1 });
        if (leaves.length === 0) return res.send({ message: 'No leaves found' });
        res.send(leaves);
    } catch (error) {
        res.status(500).json(error);
    }
};

const setLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params; // leave id
        const { status } = req.body; // Approved | Rejected
        const result = await Leave.findByIdAndUpdate(id, { status }, { new: true });
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { createLeave, listTeacherLeaves, listSchoolLeaves, setLeaveStatus };



