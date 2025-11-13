const Student = require('../models/studentSchema.js');
const Fee = require('../models/feeSchema.js');

const monthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const buildMonthRange = (monthsCount) => {
    const count = Math.max(1, Math.min(24, Number(monthsCount) || 6));
    const now = new Date();
    const range = [];
    for (let offset = count - 1; offset >= 0; offset -= 1) {
        const reference = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        range.push(monthKey(reference));
    }
    return range;
};

const getAttendanceReport = async (req, res) => {
    try {
        const { schoolId, months = 6 } = req.query;
        if (!schoolId) {
            return res.status(400).send({ message: 'School ID is required' });
        }

        const monthRange = buildMonthRange(months);
        const monthIndex = new Map(monthRange.map((key, index) => [key, index]));
        const monthly = monthRange.map((key) => ({
            month: key,
            present: 0,
            absent: 0,
        }));

        const students = await Student.find({ school: schoolId }).select('attendance');
        students.forEach((student) => {
            (student.attendance || []).forEach((entry) => {
                if (!entry?.date || !entry?.status) return;
                const entryDate = new Date(entry.date);
                if (Number.isNaN(entryDate.getTime())) return;
                const key = monthKey(entryDate);
                const idx = monthIndex.get(key);
                if (idx === undefined) return;
                if (entry.status === 'Present') monthly[idx].present += 1;
                else if (entry.status === 'Absent') monthly[idx].absent += 1;
            });
        });

        const totals = monthly.reduce(
            (acc, item) => ({
                present: acc.present + item.present,
                absent: acc.absent + item.absent,
            }),
            { present: 0, absent: 0 }
        );

        const totalMarked = totals.present + totals.absent;
        const overallPercentage = totalMarked > 0 ? Math.round((totals.present / totalMarked) * 100) : 0;

        return res.send({
            range: monthRange,
            monthly,
            totals: {
                ...totals,
                overallPercentage,
            },
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getFeesReport = async (req, res) => {
    try {
        const { schoolId, months = 6 } = req.query;
        if (!schoolId) {
            return res.status(400).send({ message: 'School ID is required' });
        }

        const monthRange = buildMonthRange(months);
        const monthIndex = new Map(monthRange.map((key, index) => [key, index]));
        const monthly = monthRange.map((key) => ({
            month: key,
            paidAmount: 0,
            unpaidAmount: 0,
            paidCount: 0,
            unpaidCount: 0,
        }));

        const fees = await Fee.find({
            school: schoolId,
            month: { $in: monthRange },
        }).select('month status amount');

        fees.forEach((fee) => {
            const idx = monthIndex.get(fee.month);
            if (idx === undefined) return;
            const amount = Number(fee.amount || 0);
            if (fee.status === 'Paid') {
                monthly[idx].paidAmount += amount;
                monthly[idx].paidCount += 1;
            } else {
                monthly[idx].unpaidAmount += amount;
                monthly[idx].unpaidCount += 1;
            }
        });

        const totals = monthly.reduce(
            (acc, item) => ({
                paidAmount: acc.paidAmount + item.paidAmount,
                unpaidAmount: acc.unpaidAmount + item.unpaidAmount,
                paidCount: acc.paidCount + item.paidCount,
                unpaidCount: acc.unpaidCount + item.unpaidCount,
            }),
            { paidAmount: 0, unpaidAmount: 0, paidCount: 0, unpaidCount: 0 }
        );

        const totalInvoices = totals.paidCount + totals.unpaidCount;
        const collectionRate = totalInvoices > 0 ? Math.round((totals.paidCount / totalInvoices) * 100) : 0;

        return res.send({
            range: monthRange,
            monthly,
            totals: {
                ...totals,
                collectionRate,
            },
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { getAttendanceReport, getFeesReport };

