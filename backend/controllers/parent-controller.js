const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');
const Sclass = require('../models/sclassSchema.js');

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
        console.log('Upserting parent:', { name, mobile, student, school });
        const parent = await Parent.findOneAndUpdate(
            { student: student },
            { name, mobile, student, school },
            { new: true, upsert: true }
        );
        console.log('Parent upserted successfully:', parent._id);
        res.send(parent);
    } catch (error) {
        console.error('Error in upsertParent:', error);
        res.status(500).json(error);
    }
};

const listParents = async (req, res) => {
    try {
        const schoolId = req.params.id;
        console.log('Fetching parents for school:', schoolId);
        const items = await Parent.find({ school: schoolId })
            .populate({
                path: 'student',
                select: 'name rollNum sclassName',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            });
        console.log(`Found ${items.length} parents for school ${schoolId}`);
        res.send(items);
    } catch (error) {
        console.error('Error in listParents:', error);
        res.status(500).json(error);
    }
};

const parentDetail = async (req, res) => {
    try {
        const item = await Parent.findById(req.params.id)
            .populate({
                path: 'student',
                select: 'name rollNum sclassName',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            });
        if (!item) return res.send({ message: 'No parent found' });
        res.send(item);
    } catch (error) {
        console.error('Error in parentDetail:', error);
        res.status(500).json(error);
    }
};

module.exports = { parentLogIn, upsertParentForStudent, upsertParent, listParents, parentDetail };


