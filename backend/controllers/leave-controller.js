const Leave = require('../models/leaveSchema.js');
const Payroll = require('../models/payrollSchema.js');

const calculateTotalDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start) || isNaN(end)) return 1;
    const diffTime = Math.abs(end - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const createLeave = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;
        const totalDays = calculateTotalDays(fromDate, toDate);
        const leave = new Leave({ ...req.body, status: 'Pending', totalDays });
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
        const { id } = req.params;
        const {
            status,
            deductionApplied,
            deductionAmount,
            deductionReason,
            approvedBy,
        } = req.body;

        const leave = await Leave.findById(id);
        if (!leave) {
            return res.status(404).send({ message: 'Leave not found' });
        }

        const previousDeduction = Number(leave.deductionAmount || 0);
        const previousDeductionApplied = leave.deductionApplied;
        const monthKey = leave.fromDate ? new Date(leave.fromDate).toISOString().slice(0, 7) : null;

        if (status) {
            leave.status = status;
        }
        if (approvedBy) {
            leave.approvedBy = approvedBy;
        }
        leave.approvedAt = new Date();

        let payrollRecord = null;
        let otherDeductions = 0;

        if (monthKey) {
            payrollRecord = await Payroll.findOne({
                teacher: leave.teacher,
                school: leave.school,
                month: monthKey,
            });
            if (payrollRecord) {
                otherDeductions = Number(payrollRecord.deductions || 0);
                if (previousDeductionApplied) {
                    otherDeductions = Math.max(0, otherDeductions - previousDeduction);
                }
            }
        }

        const applyPayrollUpdate = async (record, deductionsValue, remarks) => {
            if (!record) return undefined;
            if (record.baseAmount === undefined || record.baseAmount === null) {
                const net = Number(record.amount) || 0;
                const existingDeductions = Number(record.deductions || 0);
                record.baseAmount = net + existingDeductions;
            }
            record.deductions = Math.max(0, Number(deductionsValue) || 0);
            if (remarks) {
                record.remarks = remarks;
            }
            const base = Number(record.baseAmount) || 0;
            const finalSalary = Math.max(0, base - record.deductions);
            record.amount = finalSalary;
            await record.save();
            return finalSalary;
        };

        if (status === 'Approved') {
            const shouldDeduct = Boolean(deductionApplied) && Number(deductionAmount) > 0;
            leave.deductionApplied = shouldDeduct;

            if (shouldDeduct) {
                const newDeductionAmount = Number(deductionAmount) || 0;
                leave.deductionAmount = newDeductionAmount;
                leave.deductionReason = deductionReason || leave.deductionReason;
                leave.deductionMonth = monthKey;

                if (!payrollRecord && monthKey) {
                    payrollRecord = new Payroll({
                        teacher: leave.teacher,
                        employeeType: 'Teacher',
                        school: leave.school,
                        month: monthKey,
                        status: 'Unpaid',
                        amount: 0,
                        baseAmount: 0,
                        deductions: 0,
                    });
                    otherDeductions = 0;
                }

                if (payrollRecord) {
                    const updatedDeductions = Math.max(0, otherDeductions + newDeductionAmount);
                    const finalSalary = await applyPayrollUpdate(
                        payrollRecord,
                        updatedDeductions,
                        deductionReason || payrollRecord.remarks
                    );
                    leave.finalAmount = finalSalary;
                } else {
                    leave.finalAmount = 0;
                }
            } else {
                leave.deductionAmount = 0;
                leave.deductionReason = undefined;
                leave.deductionMonth = undefined;

                if (payrollRecord) {
                    const finalSalary = await applyPayrollUpdate(payrollRecord, otherDeductions);
                    leave.finalAmount = finalSalary;
                } else {
                    leave.finalAmount = undefined;
                }
            }
        } else {
            leave.deductionApplied = false;
            leave.deductionAmount = 0;
            leave.deductionReason = undefined;
            leave.deductionMonth = undefined;

            if (payrollRecord && previousDeductionApplied) {
                const finalSalary = await applyPayrollUpdate(payrollRecord, otherDeductions);
                leave.finalAmount = finalSalary;
            } else {
                leave.finalAmount = undefined;
            }
        }

        const updatedLeave = await leave.save();
        res.send(updatedLeave);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { createLeave, listTeacherLeaves, listSchoolLeaves, setLeaveStatus };



