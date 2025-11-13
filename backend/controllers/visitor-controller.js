const Visitor = require('../models/visitorSchema.js');

const generateVisitorCode = async () => {
    const padCode = (num) => String(num).padStart(5, '0');
    let attempts = 0;
    const maxAttempts = 50;
    while (attempts < maxAttempts) {
        const random = Math.floor(10000 + Math.random() * 90000);
        const code = padCode(random);
        const exists = await Visitor.exists({ visitorCode: code });
        if (!exists) {
            return code;
        }
        attempts += 1;
    }
    throw new Error('Unable to generate unique visitor code');
};

const createVisitor = async (req, res) => {
    try {
        const { name, contactNumber, purpose, hostName, notes, school } = req.body;
        if (!school) {
            return res.status(400).send({ message: 'School ID is required' });
        }
        if (!name) {
            return res.status(400).send({ message: 'Visitor name is required' });
        }

        const visitorCode = await generateVisitorCode();
        const visitor = new Visitor({
            visitorCode,
            name,
            contactNumber,
            purpose,
            hostName,
            notes,
            school,
        });
        const savedVisitor = await visitor.save();
        return res.send(savedVisitor);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const listVisitors = async (req, res) => {
    try {
        const { schoolId, status, limit = 100 } = req.query;
        if (!schoolId) {
            return res.status(400).send({ message: 'School ID is required' });
        }

        const query = { school: schoolId };
        if (status) {
            query.status = status;
        }

        const visitors = await Visitor.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) || 100);

        return res.send(visitors);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, checkOutTime, hostName, purpose, contactNumber } = req.body;

        const updatePayload = {};
        if (status) updatePayload.status = status;
        if (notes !== undefined) updatePayload.notes = notes;
        if (hostName !== undefined) updatePayload.hostName = hostName;
        if (purpose !== undefined) updatePayload.purpose = purpose;
        if (contactNumber !== undefined) updatePayload.contactNumber = contactNumber;
        if (checkOutTime) {
            updatePayload.checkOutTime = checkOutTime;
        } else if (status === 'Checked Out') {
            updatePayload.checkOutTime = new Date();
        }

        const visitor = await Visitor.findByIdAndUpdate(id, updatePayload, { new: true });
        if (!visitor) {
            return res.status(404).send({ message: 'Visitor not found' });
        }
        return res.send(visitor);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { createVisitor, listVisitors, updateVisitor };

