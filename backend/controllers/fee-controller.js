const Fee = require('../models/feeSchema.js');
const Student = require('../models/studentSchema.js');

// Get fees by class and month
const getFeesByClass = async (req, res) => {
    try {
        const { classId, month, schoolId } = req.query;
        
        if (!classId || !month || !schoolId) {
            return res.status(400).send({ message: 'Class ID, month, and school ID are required' });
        }

        // Get all students in the class
        const students = await Student.find({ sclassName: classId, school: schoolId })
            .populate('sclassName', 'sclassName');

        // Get fees for these students for the specified month
        const fees = await Fee.find({ 
            sclassName: classId, 
            school: schoolId, 
            month: month 
        }).populate('student', 'name rollNum');

        // Get all paid fees for all students to calculate last paid date and next payment date
        const allStudentIds = students.map(s => s._id);
        const allPaidFees = await Fee.find({
            student: { $in: allStudentIds },
            status: 'Paid',
            school: schoolId,
        }).sort({ month: -1, paidDate: -1 });

        // Create maps for current month fees and all paid fees
        const feeMap = new Map();
        fees.forEach(fee => {
            feeMap.set(fee.student._id.toString(), fee);
        });

        // Create maps for last paid info for each student (most recent payment month and its details)
        const lastPaidMap = new Map(); // studentId -> { paidDate, month, duration, latestMonth }

        allPaidFees.forEach(fee => {
            const studentId = fee.student._id ? fee.student._id.toString() : fee.student.toString();
            if (!lastPaidMap.has(studentId)) {
                // First occurrence (most recent month due to sorting)
                lastPaidMap.set(studentId, {
                    paidDate: fee.paidDate,
                    month: fee.month,
                    duration: fee.duration || 'Monthly',
                    latestMonth: fee.month,
                });
            } else {
                // Update if we find a later month
                const current = lastPaidMap.get(studentId);
                if (fee.month > current.latestMonth) {
                    current.paidDate = fee.paidDate;
                    current.month = fee.month;
                    current.duration = fee.duration || 'Monthly';
                    current.latestMonth = fee.month;
                }
            }
        });

        // Helper function to calculate next payment date
        // Next payment = last paid month + duration months
        const calculateNextPaymentDate = (lastPaidMonth, duration) => {
            if (!lastPaidMonth || !duration) return null;
            
            const [year, month] = lastPaidMonth.split('-').map(Number);
            let nextDate = new Date(year, month - 1, 1);
            
            const durationMonths = { 'Monthly': 1, '3 months': 3, '6 months': 6, 'Annual': 12 };
            const monthsToAdd = durationMonths[duration] || 1;
            nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
            
            return nextDate;
        };

        // Combine student info with fee status, last paid date, and next payment date
        const studentFees = students.map(student => {
            const fee = feeMap.get(student._id.toString());
            const lastPaidInfo = lastPaidMap.get(student._id.toString());
            const duration = lastPaidInfo?.duration || 'Monthly';
            const nextPaymentDate = lastPaidInfo 
                ? calculateNextPaymentDate(lastPaidInfo.month, duration)
                : null;

            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    rollNum: student.rollNum,
                },
                fee: fee || null,
                status: fee ? fee.status : 'Unpaid',
                lastPaidDate: lastPaidInfo?.paidDate || null,
                lastPaidMonth: lastPaidInfo?.month || null,
                nextPaymentDate: nextPaymentDate,
                duration: duration,
            };
        });

        res.send(studentFees);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Generate months array based on duration
const generateMonths = (startMonth, duration) => {
    const months = [];
    const [year, month] = startMonth.split('-').map(Number);
    let currentDate = new Date(year, month - 1, 1);
    
    for (let i = 0; i < duration; i++) {
        const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthStr);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
};

// Bulk register fees for all students in a class
const bulkRegisterFees = async (req, res) => {
    try {
        const { classId, startMonth, amount, duration, schoolId, paymentMethod, remarks } = req.body;

        if (!classId || !startMonth || !amount || !schoolId) {
            return res.status(400).send({ message: 'Class ID, start month, amount, and school ID are required' });
        }

        // Get all students in the class
        const students = await Student.find({ sclassName: classId, school: schoolId });
        if (students.length === 0) {
            return res.status(404).send({ message: 'No students found in this class' });
        }

        // If duration is provided, use it; otherwise register for single month only
        let months = [startMonth]; // Default to single month
        let durationText = 'selected month';
        
        if (duration) {
            const validDurations = { 'Monthly': 1, '3 months': 3, '6 months': 6, 'Annual': 12 };
            if (!validDurations[duration]) {
                return res.status(400).send({ message: 'Invalid duration. Must be Monthly, 3 months, 6 months, or Annual' });
            }
            months = generateMonths(startMonth, validDurations[duration]);
            durationText = duration;
        }

        const paidDate = new Date();

        // Create or update fee records for all students for the selected month(s)
        // Note: When registering without duration, we only set the amount and status as 'Unpaid'
        // Duration will be set when admin marks fees as paid via action button
        const feeOperations = [];
        for (const student of students) {
            for (const month of months) {
                feeOperations.push({
                    updateOne: {
                        filter: { student: student._id, month: month },
                        update: {
                            $set: {
                                student: student._id,
                                sclassName: classId,
                                school: schoolId,
                                month: month,
                                amount: amount,
                                // If duration is provided, mark as paid; otherwise leave as unpaid
                                status: duration ? 'Paid' : 'Unpaid',
                                paidDate: duration ? paidDate : null,
                                paymentMethod: duration ? (paymentMethod || 'Cash') : null,
                                remarks: remarks || (duration ? `Bulk registered for ${duration}` : `Fee amount registered for ${month}`),
                                duration: duration || null, // Only set duration if provided
                            }
                        },
                        upsert: true
                    }
                });
            }
        }

        await Fee.bulkWrite(feeOperations);

        res.send({ 
            message: `Successfully registered fees for ${students.length} students for ${durationText}`,
            studentsCount: students.length,
            monthsCount: months.length,
            totalRecords: students.length * months.length
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Update or create fee payment status with duration support
const updateFeeStatus = async (req, res) => {
    try {
        const { studentId, month, status, amount, paidDate, paymentMethod, remarks, schoolId, classId, duration } = req.body;

        if (!studentId || !month || !status || !schoolId || !classId) {
            return res.status(400).send({ message: 'Student ID, month, status, school ID, and class ID are required' });
        }

        // If duration is provided, update multiple months
        if (duration && status === 'Paid') {
            const validDurations = { 'Monthly': 1, '3 months': 3, '6 months': 6, 'Annual': 12 };
            const months = generateMonths(month, validDurations[duration] || 1);
            const paidDateValue = paidDate ? new Date(paidDate) : new Date();
            
            const updateOperations = months.map(monthStr => ({
                updateOne: {
                    filter: { student: studentId, month: monthStr },
                    update: {
                        $set: {
                            student: studentId,
                            sclassName: classId,
                            school: schoolId,
                            month: monthStr,
                            status: status,
                            amount: amount || 0,
                            paidDate: paidDateValue,
                            paymentMethod: paymentMethod || 'Cash',
                            remarks: remarks || `Marked as paid for ${duration}`,
                            duration: duration,
                        }
                    },
                    upsert: true
                }
            }));

            await Fee.bulkWrite(updateOperations);
            return res.send({ message: `Successfully updated fees for ${months.length} month(s)` });
        }

        // Single month update
        const updateData = {
            student: studentId,
            sclassName: classId,
            school: schoolId,
            month: month,
            status: status,
        };

        if (amount !== undefined) updateData.amount = amount;
        if (paidDate) updateData.paidDate = paidDate;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (remarks) updateData.remarks = remarks;
        if (status === 'Paid' && !paidDate) {
            updateData.paidDate = new Date();
        }

        const fee = await Fee.findOneAndUpdate(
            { student: studentId, month: month },
            updateData,
            { new: true, upsert: true }
        ).populate('student', 'name rollNum').populate('sclassName', 'sclassName');

        res.send(fee);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get fee history for a student
const getStudentFeeHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const fees = await Fee.find({ student: studentId })
            .sort({ month: -1 })
            .populate('student', 'name rollNum')
            .populate('sclassName', 'sclassName');

        res.send(fees);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get fees summary by school and month
const getFeesSummary = async (req, res) => {
    try {
        const { schoolId, month, classId } = req.query;
        
        if (!schoolId || !month) {
            return res.status(400).send({ message: 'School ID and month are required' });
        }

        // Get all paid fees for the class/school (not just selected month)
        // We need to calculate based on duration to get accurate paid amounts
        const studentQuery = classId 
            ? { school: schoolId, sclassName: classId }
            : { school: schoolId };
        
        const students = await Student.find(studentQuery).select('_id');
        const studentIds = students.map(s => s._id);
        
        // Get all paid fees for these students
        const allPaidFeesQuery = {
            student: { $in: studentIds },
            status: 'Paid',
            school: schoolId,
        };
        if (classId) {
            allPaidFeesQuery.sclassName = classId;
        }
        
        const allPaidFees = await Fee.find(allPaidFeesQuery);
        
        // Get fees for the selected month only (for paid/unpaid count)
        const monthQuery = classId 
            ? { school: schoolId, month: month, sclassName: classId }
            : { school: schoolId, month: month };
        const feesForMonth = await Fee.find(monthQuery);
        
        // Calculate paid amount based on duration
        // When fees are paid with duration, we create multiple records
        // Each record represents one month's fee, so we sum all paid amounts
        const paidAmount = allPaidFees.reduce((sum, fee) => {
            return sum + (fee.amount || 0);
        }, 0);
        
        // Count students
        const totalStudents = await Student.countDocuments(studentQuery);
        
        const summary = {
            total: totalStudents,
            paid: feesForMonth.filter(f => f.status === 'Paid').length,
            unpaid: totalStudents - feesForMonth.filter(f => f.status === 'Paid').length,
            paidAmount: paidAmount, // Total paid amount across all months based on duration
        };

        res.send(summary);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    getFeesByClass,
    updateFeeStatus,
    bulkRegisterFees,
    getStudentFeeHistory,
    getFeesSummary,
};

