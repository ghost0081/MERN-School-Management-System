const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');

// login with roll number and last 5 digits of parent's mobile
const parentLogIn = async (req, res) => {
    try {
        const { rollNum, password } = req.body; // password: last 5 of mobile
        const student = await Student.findOne({ rollNum }).populate('school', 'schoolName');
        if (!student) return res.send({ message: 'Student not found' });
        const parent = await Parent.findOne({ student: student._id });
        if (!parent) return res.send({ message: 'Parent not found' });
        const last5 = (parent.mobile || '').slice(-5);
        if (last5 !== password) return res.send({ message: 'Invalid password' });
        const payload = { _id: parent._id, name: parent.name, role: 'Parent', student: student._id, school: student.school };
        res.send(payload);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent for a student
const upsertParentForStudent = async (req, res) => {
    try {
        const { studentId, name, mobile, email, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: studentId },
            { name, mobile, email, school, student: studentId },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

// create or update parent (new function for frontend compatibility)
const upsertParent = async (req, res) => {
    try {
        const { name, mobile, student, school } = req.body;
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        res.send(parent);
    } catch (error) {
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const items = await Parent.find({ school: req.params.id })
            .populate('student', 'name rollNum')
            .populate({
                path: 'student',
                populate: {
                    path: 'sclassName',
                    model: 'Sclass'
                }
            });
        res.send(items);
    } catch (error) {
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id).populate('student', 'name rollNum sclassName');
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };


