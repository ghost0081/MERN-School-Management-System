const Assignment = require('../models/assignmentSchema.js');
const Student = require('../models/studentSchema.js');

// Teacher creates assignment for a subject and class
const createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, subject, sclassName, school, teacher } = req.body;

        const students = await Student.find({ sclassName, school });
        const studentStatus = students.map(s => ({ student: s._id }));

        const assignment = new Assignment({
            title,
            description,
            dueDate,
            subject,
            sclassName,
            school,
            teacher,
            studentStatus
        });

        const result = await assignment.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// List assignments by school or by class/subject
const listAssignments = async (req, res) => {
    try {
        const { scope, id } = req.params; // scope: school|class|subject|student
        let filter = {};
        if (scope === 'school') filter.school = id;
        if (scope === 'class') filter.sclassName = id;
        if (scope === 'subject') filter.subject = id;
        if (scope === 'student') filter['studentStatus.student'] = id;

        const assignments = await Assignment.find(filter)
            .populate('subject', 'subName')
            .populate('sclassName', 'sclassName')
            .populate('teacher', 'name')
            .populate('studentStatus.student', 'name');

        if (assignments.length === 0) {
            return res.send({ message: 'No assignments found' });
        }
        res.send(assignments);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Student submits assignment (marks as Submitted)
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.body;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.send({ message: 'Assignment not found' });

        const entry = assignment.studentStatus.find(s => s.student.toString() === studentId);
        if (!entry) return res.send({ message: 'Student not mapped to assignment' });

        entry.status = 'Submitted';
        entry.updatedAt = new Date();
        const result = await assignment.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Teacher reviews/grades a submission
const reviewAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId, marks } = req.body;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.send({ message: 'Assignment not found' });

        const entry = assignment.studentStatus.find(s => s.student.toString() === studentId);
        if (!entry) return res.send({ message: 'Student not mapped to assignment' });

        entry.status = 'Submitted';
        entry.marks = marks;
        entry.updatedAt = new Date();
        const result = await assignment.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { createAssignment, listAssignments, submitAssignment, reviewAssignment };
// Update one student's assignment status explicitly (teacher action)
const setAssignmentStatus = async (req, res) => {
    try {
        const { assignmentId, studentId, status } = req.body; // status: 'Assigned' | 'Submitted'
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.send({ message: 'Assignment not found' });
        const entry = assignment.studentStatus.find(s => s.student.toString() === studentId);
        if (!entry) return res.send({ message: 'Student not mapped to assignment' });
        entry.status = status;
        entry.updatedAt = new Date();
        const result = await assignment.save();
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { createAssignment, listAssignments, submitAssignment, reviewAssignment, setAssignmentStatus };


